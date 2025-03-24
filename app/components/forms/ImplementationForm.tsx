"use client";
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card } from '../ui/Card';
import { LocationType } from '../ui/LocationType';
import { InputWithCost } from '../ui/InputWithCost';
import { AccommodationToggle } from '../ui/AccommodationToggle';
import { ExternalService } from '../ui/ExternalService';
import { TotalCostDisplay } from '../ui/TotalCostDisplay';
import { fetchDistance } from '../../lib/distanceCalculator';

interface CalculationResponse {
  success: boolean;
  data: {
    daytimeCost: number;
    nighttimeCost: number;
    kmCost: number;
    accommodationCost: number;
    mealsCost: number;
    totalCost: number;
  };
}

interface ImplementationFormProps {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onTotalCostChange?: (cost: number) => void;
  clientId?: string | null;
}

export const ImplementationForm = forwardRef<
  { getFormData: () => any; clearForm: () => void },
  ImplementationFormProps
>(({
  collapsible = false,
  defaultCollapsed = false,
  onTotalCostChange,
  clientId = null,
}, ref) => {
  // Form state
  const [locationType, setLocationType] = useState<'internal' | 'external'>('internal');
  const [numDays, setNumDays] = useState(1);
  const [numNights, setNumNights] = useState(0);
  const [numPeople, setNumPeople] = useState(1);
  const [implMorada, setImplMorada] = useState('');
  const [implCPostal, setImplCPostal] = useState('');
  const [daytimeHours, setDaytimeHours] = useState(0);
  const [nighttimeHours, setNighttimeHours] = useState(0);
  const [kilometers, setKilometers] = useState(0);
  const [hasAccommodation, setHasAccommodation] = useState(false);
  const [numMeals, setNumMeals] = useState(0);
  const [externalServiceCost, setExternalServiceCost] = useState(0);

  // Calculated costs
  const [daytimeCost, setDaytimeCost] = useState(0);
  const [nighttimeCost, setNighttimeCost] = useState(0);
  const [kmCost, setKmCost] = useState(0);
  const [accommodationCost, setAccommodationCost] = useState(0);
  const [mealsCost, setMealsCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Handle field changes with immediate calculation
  const handleDaytimeHoursChange = async (value: number) => {
    console.log('Implementation - Daytime hours changed to:', value);
    setDaytimeHours(value);
    // Calculate only daytime cost specifically
    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationType,
          numDays,
          numPeople,
          daytimeHours: value, // Use the new value directly
          nighttimeHours, // Keep current value
          kilometers,
          hasAccommodation,
          numMeals,
          externalServiceCost,
          clientId,
        }),
      });

      const data = await response.json() as CalculationResponse;
      
      if (data.success && data.data) {
        console.log('IMPLEMENTATION DAYTIME RESULT:', data.data.daytimeCost);
        setDaytimeCost(data.data.daytimeCost || 0);
        // Only update related costs but preserve nighttime cost
        updateTotalCost({
          daytimeCost: data.data.daytimeCost || 0,
          kmCost: data.data.kmCost || 0,
          accommodationCost: data.data.accommodationCost || 0,
          mealsCost: data.data.mealsCost || 0,
        });
      }
    } catch (error) {
      console.error('Error calculating implementation daytime cost:', error);
    }
  };

  const handleNighttimeHoursChange = async (value: number) => {
    console.log('Implementation - Nighttime hours changed to:', value);
    setNighttimeHours(value);
    // Calculate only nighttime cost specifically
    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationType,
          numNights,
          numPeople,
          daytimeHours, // Keep current value
          nighttimeHours: value, // Use the new value directly
          kilometers,
          hasAccommodation,
          numMeals,
          externalServiceCost,
          clientId,
        }),
      });

      const data = await response.json() as CalculationResponse;
      
      if (data.success && data.data) {
        console.log('IMPLEMENTATION NIGHTTIME RESULT:', data.data.nighttimeCost);
        setNighttimeCost(data.data.nighttimeCost || 0);
        // Only update nighttime cost without affecting daytime
        updateTotalCost({
          nighttimeCost: data.data.nighttimeCost || 0,
        });
      }
    } catch (error) {
      console.error('Error calculating implementation nighttime cost:', error);
    }
  };

  const handleKilometersChange = async (value: number) => {
    console.log('Implementation Kilometers changed to:', value);
    setKilometers(value);
    
    // Instead of calling calculateCosts() which resets everything,
    // just calculate the km cost and update the total
    try {
      const response = await fetch('/api/calculations/kilometers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kilometers: value }),
      });
      
      const data = await response.json();
      if (data.success && data.kmCost !== undefined) {
        // Only update the km cost
        setKmCost(data.kmCost);
        
        // Update the total without changing other values
        updateTotalCost({ kmCost: data.kmCost });
      }
    } catch (error) {
      console.error('Error calculating km cost:', error);
    }
  };

  const handleNumMealsChange = (value: number) => {
    setNumMeals(value);
    if (value === 0) {
      setMealsCost(0);
      updateTotalCost({ mealsCost: 0 });
    }
  };

  const handleExternalServiceChange = (value: number) => {
    setExternalServiceCost(value);
    if (value === 0) {
      updateTotalCost({ externalServiceCost: 0 });
    }
  };

  const handleImplCPostalChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const postalCode = e.target.value;
    setImplCPostal(postalCode);
    
    // Only calculate distance if postal code is valid
    if (postalCode && postalCode.length >= 4) {
      try {
        console.log('Implementation form: Fetching distance for postal code:', postalCode);
        const distance = await fetchDistance(postalCode);
        console.log('Implementation form: Distance result:', distance);
        
        // First update the kilometers state
        setKilometers(distance);
        
        // Instead of calling calculateCosts() which resets everything, 
        // just calculate the km cost and update the total
        try {
          const response = await fetch('/api/calculations/kilometers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ kilometers: distance }),
          });
          
          const data = await response.json();
          if (data.success && data.kmCost !== undefined) {
            // Only update the km cost
            setKmCost(data.kmCost);
            
            // Update the total without changing other values
            updateTotalCost({ kmCost: data.kmCost });
          }
        } catch (error) {
          console.error('Error calculating km cost:', error);
        }
      } catch (error) {
        console.error('Error calculating distance:', error);
      }
    }
  };

  // Helper function to update total cost
  const updateTotalCost = (updates: Partial<{
    daytimeCost: number;
    nighttimeCost: number;
    kmCost: number;
    accommodationCost: number;
    mealsCost: number;
    externalServiceCost: number;
  }>) => {
    const newTotal = (updates.daytimeCost ?? daytimeCost) +
                    (updates.nighttimeCost ?? nighttimeCost) +
                    (updates.kmCost ?? kmCost) +
                    (updates.accommodationCost ?? accommodationCost) +
                    (updates.mealsCost ?? mealsCost) +
                    (updates.externalServiceCost ?? externalServiceCost);
    setTotalCost(newTotal);
    onTotalCostChange?.(newTotal);
  };

  // Define calculateCosts using useCallback to prevent infinite loops
  // This will only be used for initial load and overall recalculations
  const calculateCosts = useCallback(async () => {
    console.log('FULL CALCULATION - Implementation Form:', {
      locationType,
      numDays,
      numNights,
      numPeople,
      daytimeHours,
      nighttimeHours,
      kilometers,
      hasAccommodation,
      numMeals,
      externalServiceCost,
      clientId,
    });

    try {
      const response = await fetch('/api/calculations/implementation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationType,
          numDays,
          numNights,
          numPeople,
          daytimeHours,
          nighttimeHours,
          kilometers,
          hasAccommodation,
          numMeals,
          externalServiceCost,
          clientId,
        }),
      });

      const data = await response.json() as CalculationResponse;
      
      if (data.success && data.data) {
        console.log('FULL CALCULATION RESULTS - Implementation:', data.data);
        // Update all costs at once
        setDaytimeCost(data.data.daytimeCost || 0);
        setNighttimeCost(data.data.nighttimeCost || 0);
        setKmCost(data.data.kmCost || 0);
        setAccommodationCost(data.data.accommodationCost || 0);
        setMealsCost(data.data.mealsCost || 0);
        setTotalCost(data.data.totalCost || 0);
        
        // Notify parent component
        if (onTotalCostChange) {
          onTotalCostChange(data.data.totalCost || 0);
        }
      }
    } catch (error) {
      console.error('ERROR - Implementation Full Calculation:', error);
    }
  }, [
    locationType,
    numDays,
    numNights,
    numPeople,
    // Removed daytimeHours and nighttimeHours from dependencies
    // so individual handlers can manage them
    kilometers,
    hasAccommodation,
    numMeals,
    externalServiceCost,
    clientId,
    onTotalCostChange,
  ]);

  // Load initial calculations
  useEffect(() => {
    calculateCosts();
  }, [calculateCosts]);

  // Function to clear all form fields
  const clearForm = () => {
    setNumDays(1);
    setNumNights(0);
    setNumPeople(1);
    setImplMorada('');
    setImplCPostal('');
    setDaytimeHours(0);
    setNighttimeHours(0);
    setKilometers(0);
    setHasAccommodation(false);
    setNumMeals(0);
    setExternalServiceCost(0);
    setDaytimeCost(0);
    setNighttimeCost(0);
    setKmCost(0);
    setAccommodationCost(0);
    setMealsCost(0);
    setTotalCost(0);
    
    if (onTotalCostChange) {
      onTotalCostChange(0);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      locationType,
      numDays,
      numNights,
      numPeople,
      implMorada,
      implCPostal,
      daytimeHours,
      nighttimeHours,
      kilometers,
      hasAccommodation,
      numMeals,
      externalServiceCost
    }),
    clearForm
  }));

  return (
    <Card 
      title="IMPLEMENTAÇÃO" 
      collapsible={collapsible} 
      defaultCollapsed={defaultCollapsed}
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <button
            onClick={clearForm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Limpar Cálculos
          </button>
        </div>
        <LocationType 
          value={locationType} 
          onChange={setLocationType} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithCost 
            label="Nº Dias" 
            value={numDays} 
            onChange={setNumDays} 
            cost={0} 
            min={1} 
          />
          <InputWithCost 
            label="Nº Noites" 
            value={numNights} 
            onChange={setNumNights} 
            cost={0} 
            min={0} 
          />
          <InputWithCost 
            label="Nº Pessoas" 
            value={numPeople} 
            onChange={setNumPeople} 
            cost={0} 
            min={0.5} 
            step={0.5} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithCost 
            label="Nº Horas Dia" 
            value={daytimeHours} 
            onChange={handleDaytimeHoursChange} 
            cost={daytimeCost} 
            min={0} 
            step={0.5} 
          />
          <InputWithCost 
            label="Nº Horas Noite" 
            value={nighttimeHours} 
            onChange={handleNighttimeHoursChange} 
            cost={nighttimeCost} 
            min={0} 
            step={0.5} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-200">Morada</label>
            <input
              type="text"
              value={implMorada}
              onChange={(e) => setImplMorada(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-200">C. Postal</label>
            <input
              type="text"
              value={implCPostal}
              onChange={handleImplCPostalChange}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <InputWithCost 
            label="Kms" 
            value={kilometers} 
            onChange={handleKilometersChange} 
            cost={kmCost} 
            min={0} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccommodationToggle 
            value={hasAccommodation} 
            onChange={setHasAccommodation} 
            cost={accommodationCost} 
          />
          <InputWithCost 
            label="Nº Refeições" 
            value={numMeals} 
            onChange={handleNumMealsChange} 
            cost={mealsCost} 
            min={0} 
          />
        </div>

        <ExternalService 
          value={externalServiceCost} 
          onChange={handleExternalServiceChange} 
        />

        <TotalCostDisplay totalCost={totalCost} />
      </div>
    </Card>
  );
});
