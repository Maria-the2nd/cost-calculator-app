"use client";
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';
import { Card } from '../ui/Card';
import { LocationType } from '../ui/LocationType';
import { InputWithCost } from '../ui/InputWithCost';
import { AccommodationToggle } from '../ui/AccommodationToggle';
import { ExternalService } from '../ui/ExternalService';
import { TotalCostDisplay } from '../ui/TotalCostDisplay';
import { useDistanceCalculator } from '@/hooks/useDistanceCalculator';
import { cn } from '@/lib/utils';
import { DistanceCalculator } from '@/utils/distanceCalculator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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
  className?: string;
}

export const ImplementationForm = forwardRef<
  { getFormData: () => any; clearForm: () => void },
  ImplementationFormProps
>(({
  collapsible = false,
  defaultCollapsed = false,
  onTotalCostChange,
  clientId = null,
  className = '',
}, ref) => {
  // Form state
  const [impl_days, setImplDays] = useState(1);
  const [impl_nights, setImplNights] = useState(1);
  const [impl_people, setImplPeople] = useState(1);
  const [impl_day_hours, setImplDayHours] = useState(0);
  const [impl_night_hours, setImplNightHours] = useState(0);
  const [impl_kilometers, setImplKilometers] = useState(0);
  const [impl_accommodation, setImplAccommodation] = useState(false);
  const [impl_meals, setImplMeals] = useState(0);
  const [impl_external_service, setImplExternalService] = useState(0);
  const [impl_morada, setImplMorada] = useState('');
  const [impl_c_postal, setImplCPostal] = useState('');

  // Cost state
  const [daytimeCost, setDaytimeCost] = useState(0);
  const [nighttimeCost, setNighttimeCost] = useState(0);
  const [kmCost, setKmCost] = useState(0);
  const [accommodationCost, setAccommodationCost] = useState(0);
  const [mealsCost, setMealsCost] = useState(0);
  const [impl_total_cost, setImplTotalCost] = useState(0);

  const { calculateDistance, isCalculating, error: distanceError } = useDistanceCalculator();
  const divRef = useRef<HTMLDivElement>(null);

  // Define calculateCosts using useCallback to prevent infinite loops
  const calculateCosts = useCallback(async () => {
    try {
      const response = await fetch('/api/calculations/implementation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          impl_days,
          impl_nights,
          impl_people,
          impl_day_hours,
          impl_night_hours,
          impl_kilometers,
          impl_accommodation,
          impl_meals,
          impl_external_service,
          impl_morada,
          impl_c_postal,
          clientId
        }),
      });

      const data = await response.json() as CalculationResponse;
      
      if (data.success && data.data) {
        setDaytimeCost(data.data.daytimeCost || 0);
        setNighttimeCost(data.data.nighttimeCost || 0);
        setKmCost(data.data.kmCost || 0);
        setAccommodationCost(data.data.accommodationCost || 0);
        setMealsCost(data.data.mealsCost || 0);
        setImplTotalCost(data.data.totalCost || 0);
        
        if (onTotalCostChange) {
          onTotalCostChange(data.data.totalCost || 0);
        }
      }
    } catch (error) {
      console.error('Error calculating costs:', error);
    }
  }, [
    impl_days,
    impl_nights,
    impl_people,
    impl_day_hours,
    impl_night_hours,
    impl_kilometers,
    impl_accommodation,
    impl_meals,
    impl_external_service,
    impl_morada,
    impl_c_postal,
    clientId,
    onTotalCostChange,
  ]);

  // Load initial calculations
  useEffect(() => {
    calculateCosts();
  }, [calculateCosts]);

  // Handle field changes with immediate calculation
  const handleDayHoursChange = async (value: number) => {
    setImplDayHours(value);
    calculateCosts();
  };

  const handleNightHoursChange = async (value: number) => {
    setImplNightHours(value);
    calculateCosts();
  };

  const handleKilometersChange = async (value: number) => {
    setImplKilometers(value);
    calculateCosts();
  };

  const handleNumMealsChange = async (value: number) => {
    setImplMeals(value);
    calculateCosts();
  };

  const handleAccommodationChange = async (value: boolean) => {
    setImplAccommodation(value);
    calculateCosts();
  };

  const handleNumDaysChange = async (value: number) => {
    setImplDays(value);
    calculateCosts();
  };

  const handleNumNightsChange = async (value: number) => {
    setImplNights(value);
    calculateCosts();
  };

  const handleNumPeopleChange = async (value: number) => {
    setImplPeople(value);
    calculateCosts();
  };

  const handleExternalServiceChange = async (value: number) => {
    setImplExternalService(value);
    calculateCosts();
  };

  const handleMoradaChange = async (value: string) => {
    setImplMorada(value);
  };

  const handleCPostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('📮 Implementation - handleCPostalChange triggered');
    console.log('📮 Implementation - Current value:', value);
    console.log('📮 Implementation - Previous value:', impl_c_postal);
    setImplCPostal(value);
  };

  const handleCPostalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('⌨️ Implementation - handleCPostalKeyDown triggered');
    console.log('⌨️ Implementation - Key pressed:', e.key);
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('⌨️ Implementation - Enter pressed with postal code:', impl_c_postal);
    }
  };

  // Function to clear all form fields
  const clearForm = () => {
    setImplDays(1);
    setImplNights(1);
    setImplPeople(1);
    setImplDayHours(0);
    setImplNightHours(0);
    setImplKilometers(0);
    setImplAccommodation(false);
    setImplMeals(0);
    setImplExternalService(0);
    setImplMorada('');
    setImplCPostal('');
    setDaytimeCost(0);
    setNighttimeCost(0);
    setKmCost(0);
    setAccommodationCost(0);
    setMealsCost(0);
    setImplTotalCost(0);
    
    if (onTotalCostChange) {
      onTotalCostChange(0);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      impl_days,
      impl_nights,
      impl_people,
      impl_day_hours,
      impl_night_hours,
      impl_kilometers,
      impl_accommodation,
      impl_meals,
      impl_external_service,
      impl_morada,
      impl_c_postal,
      impl_total_cost
    }),
    clearForm
  }));

  return (
    <Card
      title="IMPLEMENTAÇÃO"
      collapsible={collapsible} 
      defaultCollapsed={defaultCollapsed}
    >
      <div ref={divRef} className={cn("space-y-4 p-6", className)}>
        <div className="flex justify-end">
          <button
            onClick={clearForm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Limpar Cálculos
          </button>
        </div>
        <LocationType 
          value={impl_accommodation ? 'external' : 'internal'} 
          onChange={(value) => {
            if (value === 'external') {
              setImplAccommodation(true);
            } else {
              setImplAccommodation(false);
            }
          }} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithCost 
            label="Nº Dias" 
            value={impl_days} 
            onChange={handleNumDaysChange} 
            cost={0} 
            min={1} 
          />
          <InputWithCost 
            label="Nº Noites" 
            value={impl_nights} 
            onChange={handleNumNightsChange} 
            cost={0} 
            min={1} 
          />
          <InputWithCost 
            label="Nº Pessoas" 
            value={impl_people} 
            onChange={handleNumPeopleChange} 
            cost={0} 
            min={0.5} 
            step={0.5} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithCost 
            label="Nº Horas Dia" 
            value={impl_day_hours} 
            onChange={handleDayHoursChange} 
            cost={daytimeCost} 
            min={0} 
            step={0.5} 
          />
          <InputWithCost 
            label="Nº Horas Noite" 
            value={impl_night_hours} 
            onChange={handleNightHoursChange} 
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
              value={impl_morada}
              onChange={(e) => handleMoradaChange(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-200">C. Postal</label>
            <input
              type="text"
              value={impl_c_postal}
              onChange={handleCPostalChange}
              onKeyDown={handleCPostalKeyDown}
              placeholder="0000-000"
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="impl_kilometers">Kms</Label>
            <Input
              type="number"
              id="impl_kilometers"
              value={impl_kilometers}
              onChange={(e) => handleKilometersChange(Number(e.target.value))}
              readOnly
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="impl_accommodation">Accommodation</Label>
            <AccommodationToggle 
              value={impl_accommodation} 
              onChange={handleAccommodationChange} 
              cost={accommodationCost} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWithCost 
            label="Nº Refeições" 
            value={impl_meals} 
            onChange={handleNumMealsChange} 
            cost={mealsCost} 
            min={0} 
          />
        </div>

        <ExternalService 
          value={impl_external_service} 
          onChange={handleExternalServiceChange} 
        />

        <TotalCostDisplay totalCost={impl_total_cost} />
      </div>
    </Card>
  );
});
