'use client';

import React, { useState, useEffect, useRef } from 'react';
import { loadMapsApi, isMapsApiLoaded } from './mapScriptLoader';

// Fixed origin address (Estrada de S. Marcos, nº 11, 2735-521 Cacém, Portugal)
const ORIGIN_ADDRESS = "Estrada de S. Marcos, nº 11, 2735-521 Cacém, Portugal";
const ORIGIN_POSTAL_CODE = "2735-521";

// Format postal code with hyphen (1234-567)
const formatPostalCode = (postalCode: string): string => {
  // Remove all non-digits
  const cleaned = postalCode.replace(/[^\d]/g, '');
  
  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 7) {
    // Format with hyphen
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else {
    // Limit to 7 digits total
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}`;
  }
};

interface PostalCodeDistanceCalculatorProps {
  onDistanceCalculated?: (distance: number) => void;
  onPostalCodeChange?: (value: string) => void;
  postalCode?: string;
  readOnly?: boolean;
  placeholder?: string;
  label?: string;
  className?: string;
}

/**
 * A simple postal code input component that calculates the distance
 * from the fixed office location in Cacém.
 */
export const PostalCodeDistanceCalculator = function PostalCodeDistanceCalculator({ 
  onDistanceCalculated, 
  onPostalCodeChange,
  postalCode: externalPostalCode = '',
  readOnly = false,
  placeholder = "0000-000",
  label = "Código Postal",
  className = ""
}: PostalCodeDistanceCalculatorProps) {
  const [postalCode, setPostalCode] = useState(externalPostalCode);
  const [loading, setLoading] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Handle postal code input change
  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPostalCode(rawValue);
    setPostalCode(formattedValue);
    setError(null);
    
    if (onPostalCodeChange) {
      onPostalCodeChange(formattedValue);
    }
    
    // If we have a complete postal code, calculate distance
    if (formattedValue.length >= 7) {
      calculateDistance(formattedValue);
    }
  };
  
  // Load Google Maps API on component mount
  useEffect(() => {
    const loadApi = async () => {
      if (!isMapsApiLoaded()) {
        setLoading(true);
        try {
          await loadMapsApi();
          console.log("Google Maps API loaded successfully!");
          setGoogleMapsLoaded(true);
          setLoading(false);
          
          // If we already have a postal code, calculate distance
          if (postalCode.length >= 7) {
            calculateDistance(postalCode);
          }
        } catch (error) {
          console.error("Failed to load Google Maps API:", error);
          setLoading(false);
          setError("Falha ao carregar o Google Maps API. Usando estimativa alternativa.");
          
          // Fallback to estimation
          if (postalCode.length >= 7) {
            const estimatedDistance = estimateDistanceByPostalCodes(ORIGIN_POSTAL_CODE, postalCode);
            if (onDistanceCalculated) {
              onDistanceCalculated(estimatedDistance);
            }
          }
        }
      } else {
        console.log("Google Maps API already loaded!");
        setGoogleMapsLoaded(true);
        
        // If we already have a postal code, calculate distance
        if (postalCode.length >= 7) {
          calculateDistance(postalCode);
        }
      }
    };
    
    loadApi();
  }, []);
  
  // Calculate distance when postal code changes and Google Maps is loaded
  useEffect(() => {
    if (googleMapsLoaded && postalCode.length >= 7) {
      calculateDistance(postalCode);
    }
  }, [postalCode, googleMapsLoaded, retryCount]);
  
  // Handle retry button click
  const handleRetry = () => {
    if (postalCode.length >= 7) {
      setRetryCount(prev => prev + 1);
      setError(null);
      calculateDistance(postalCode);
    }
  };
  
  // Calculate distance using Google Maps Distance Matrix API
  const calculateDistance = (destPostalCode: string) => {
    if (!googleMapsLoaded || !window.google) {
      console.log("Google Maps not loaded yet, using estimation");
      // Fallback to estimation
      const estimatedDistance = estimateDistanceByPostalCodes(ORIGIN_POSTAL_CODE, destPostalCode);
      if (onDistanceCalculated) {
        onDistanceCalculated(estimatedDistance);
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // First, geocode the postal code to get the location
      const geocoder = new window.google.maps.Geocoder();
      
      console.log(`Geocoding: ${destPostalCode}, Portugal`);
      geocoder.geocode(
        { address: destPostalCode + ", Portugal" },
        (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
          if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
            const destination = results[0].formatted_address;
            console.log(`Geocoded address: ${destination}`);
            
            // Now use Distance Matrix API to calculate the distance
            const service = new window.google.maps.DistanceMatrixService();
            
            service.getDistanceMatrix(
              {
                origins: [ORIGIN_ADDRESS],
                destinations: [destination],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.METRIC,
              },
              (response: google.maps.DistanceMatrixResponse, status: google.maps.DistanceMatrixStatus) => {
                setLoading(false);
                
                if (
                  status === window.google.maps.DistanceMatrixStatus.OK &&
                  response.rows[0].elements[0].status === "OK"
                ) {
                  // Get distance in kilometers
                  const distanceInMeters = response.rows[0].elements[0].distance.value;
                  const distanceInKm = Math.round(distanceInMeters / 1000);
                  console.log(`Distance calculated: ${distanceInKm} km`);
                  
                  // Update the distance
                  if (onDistanceCalculated) {
                    onDistanceCalculated(distanceInKm);
                  }
                } else {
                  console.error("Error calculating distance:", status);
                  setError("Não foi possível calcular a distância. Usando estimativa.");
                  
                  // Fallback to estimation
                  const estimatedDistance = estimateDistanceByPostalCodes(ORIGIN_POSTAL_CODE, destPostalCode);
                  if (onDistanceCalculated) {
                    onDistanceCalculated(estimatedDistance);
                  }
                }
              }
            );
          } else {
            console.error("Geocoding failed:", status);
            setLoading(false);
            setError("Código postal não encontrado. Usando estimativa.");
            
            // Fallback to estimation
            const estimatedDistance = estimateDistanceByPostalCodes(ORIGIN_POSTAL_CODE, destPostalCode);
            if (onDistanceCalculated) {
              onDistanceCalculated(estimatedDistance);
            }
          }
        }
      );
    } catch (error) {
      console.error("Error in distance calculation:", error);
      setLoading(false);
      setError("Erro no cálculo da distância. Usando estimativa.");
      
      // Fallback to estimation
      const estimatedDistance = estimateDistanceByPostalCodes(ORIGIN_POSTAL_CODE, destPostalCode);
      if (onDistanceCalculated) {
        onDistanceCalculated(estimatedDistance);
      }
    }
  };

  // Calculate distance based on postal code prefixes
  const estimateDistanceByPostalCodes = (originPostal: string, destPostal: string): number => {
    // Simple distance estimation based on postal code prefixes
    const originPrefix = parseInt(originPostal.substring(0, 4), 10);
    const destPrefix = parseInt(destPostal.substring(0, 4), 10);
    
    // Simple difference calculation (very basic approximation)
    const difference = Math.abs(originPrefix - destPrefix);
    return Math.min(difference * 5, 500); // Limit max distance to 500km for this estimation
  };

  return (
    <div className={className}>
      <label htmlFor="postal-code-input" className="text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id="postal-code-input"
          className={`w-full rounded-lg bg-gray-800 px-3 py-2 text-white border ${error ? 'border-red-500' : 'border-gray-700'} focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50`}
          placeholder={placeholder}
          value={postalCode}
          onChange={handlePostalCodeChange}
          readOnly={readOnly}
          maxLength={8}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-xs font-medium text-orange-400">A calcular...</span>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-1 flex items-center">
          <p className="text-xs text-red-400 flex-1">{error}</p>
          <button 
            onClick={handleRetry}
            className="text-xs text-orange-500 hover:text-orange-400 ml-2"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
};

// Also keep the default export for backward compatibility
export default PostalCodeDistanceCalculator; 