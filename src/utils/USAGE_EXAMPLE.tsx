import React, { useState, useEffect } from 'react';
import { PostalCodeDistanceCalculator } from './PostalCodeDistanceCalculator';
import { usePostalCodeDistance } from './usePostalCodeDistance';

/**
 * Example component demonstrating how to use the PostalCodeDistanceCalculator
 * and usePostalCodeDistance hook in a form component.
 */
export function PostalCodeDistanceExample() {
  // Initialize form state
  const [formData, setFormData] = useState({
    address: '',
    kilometers: 0,
    // Other form fields...
  });
  
  // Use the custom hook to manage postal code and distance state
  const {
    postalCode,
    distance,
    handlePostalCodeChange,
    handleDistanceCalculated
  } = usePostalCodeDistance();
  
  // Update form when distance changes
  useEffect(() => {
    if (distance > 0) {
      setFormData(prev => ({
        ...prev,
        kilometers: distance
      }));
      
      // This would be where you recalculate costs
      console.log(`Distance updated to ${distance} km`);
    }
  }, [distance]);
  
  // Handle changes to other form fields
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle manual changes to the kilometers field
  const handleKilometersChange = (value: number) => {
    setFormData(prev => ({
      ...prev,
      kilometers: value
    }));
    
    // Update the distance calculator's internal state
    handleDistanceCalculated(value);
  };
  
  return (
    <div className="space-y-4 p-4 bg-gray-900 text-white rounded-lg max-w-md">
      <h2 className="text-lg font-bold text-orange-500">
        Postal Code Distance Calculator Example
      </h2>
      
      <div className="space-y-4">
        {/* Address field */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-200">Morada</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          />
        </div>
        
        {/* Postal code with distance calculator */}
        <PostalCodeDistanceCalculator
          postalCode={postalCode}
          onPostalCodeChange={handlePostalCodeChange}
          onDistanceCalculated={handleDistanceCalculated}
        />
        
        {/* Kilometers field that gets updated automatically */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-gray-200">Kms</label>
          <div className="relative">
            <input
              type="number"
              value={formData.kilometers}
              onChange={(e) => handleKilometersChange(parseFloat(e.target.value) || 0)}
              min={0}
              max={1000}
              step={1}
              readOnly={distance > 0}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50"
            />
            {distance > 0 && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <span className="text-xs font-medium text-orange-400">
                  Auto-calculado
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Display calculated costs */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Custo por Km:</span>
            <span className="text-sm font-bold text-orange-500">€0.50</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm font-medium text-gray-300">Custo total (Km):</span>
            <span className="text-sm font-bold text-orange-500">
              €{(formData.kilometers * 0.5).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-4">
        <p>
          <strong>Nota:</strong> Este exemplo demonstra como utilizar o componente PostalCodeDistanceCalculator
          e o hook usePostalCodeDistance numa aplicação React com TypeScript.
        </p>
      </div>
    </div>
  );
} 