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
  data?: {
    daytimeCost: number;
    nighttimeCost: number;
    kmCost: number;
    accommodationCost: number;
    mealsCost: number;
    totalCost: number;
  };
  error?: string;
}

interface TechnicalVisitFormProps {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onTotalCostChange?: (cost: number) => void;
  clientId?: string | null;
  className?: string;
}

export const TechnicalVisitForm = forwardRef<
  { getFormData: () => any; clearForm: () => void },
  TechnicalVisitFormProps
>(({
  collapsible = false,
  defaultCollapsed = false,
  onTotalCostChange,
  clientId = null,
  className = '',
}, ref) => {
  // Form state
  const [visit_days, setVisitDays] = useState(1);
  const [visit_nights, setVisitNights] = useState(1);
  const [visit_people, setVisitPeople] = useState(1);
  const [visit_day_hours, setVisitDayHours] = useState(0);
  const [visit_night_hours, setVisitNightHours] = useState(0);
  const [visit_kilometers, setVisitKilometers] = useState(0);
  const [visit_accommodation, setVisitAccommodation] = useState(false);
  const [visit_meals, setVisitMeals] = useState(0);
  const [visit_external_service, setVisitExternalService] = useState(0);
  const [visit_morada, setVisitMorada] = useState('');
  const [visit_c_postal, setVisitCPostal] = useState('');

  // Cost state
  const [daytimeCost, setDaytimeCost] = useState(0);
  const [nighttimeCost, setNighttimeCost] = useState(0);
  const [kmCost, setKmCost] = useState(0);
  const [accommodationCost, setAccommodationCost] = useState(0);
  const [mealsCost, setMealsCost] = useState(0);
  const [visit_total_cost, setVisitTotalCost] = useState(0);

  const { calculateDistance, isCalculating, error: distanceError } = useDistanceCalculator();
  const divRef = useRef<HTMLDivElement>(null);

  // Define calculateCosts using useCallback to prevent infinite loops
  const calculateCosts = useCallback(async () => {
    try {
      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visit_days,
          visit_nights,
          visit_people,
          visit_day_hours,
          visit_night_hours,
          visit_kilometers,
          visit_accommodation,
          visit_meals,
          visit_external_service,
          visit_morada,
          visit_c_postal,
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
        setVisitTotalCost(data.data.totalCost || 0);
        
        if (onTotalCostChange) {
          onTotalCostChange(data.data.totalCost || 0);
        }
      }
    } catch (error) {
      console.error('Error calculating costs:', error);
    }
  }, [
    visit_days,
    visit_nights,
    visit_people,
    visit_day_hours,
    visit_night_hours,
    visit_kilometers,
    visit_accommodation,
    visit_meals,
    visit_external_service,
    visit_morada,
    visit_c_postal,
    clientId,
    onTotalCostChange,
  ]);

  // Load initial calculations
  useEffect(() => {
    calculateCosts();
  }, [calculateCosts]);

  // Handle field changes with immediate calculation
  const handleDayHoursChange = async (value: number) => {
    setVisitDayHours(value);
    calculateCosts();
  };

  const handleNightHoursChange = async (value: number) => {
    setVisitNightHours(value);
    calculateCosts();
  };

  const handleKilometersChange = async (value: number) => {
    setVisitKilometers(value);
    calculateCosts();
  };

  const handleNumMealsChange = async (value: number) => {
    setVisitMeals(value);
    calculateCosts();
  };

  const handleAccommodationChange = async (value: boolean) => {
    setVisitAccommodation(value);
    calculateCosts();
  };

  const handleNumDaysChange = async (value: number) => {
    setVisitDays(value);
    calculateCosts();
  };

  const handleNumNightsChange = async (value: number) => {
    setVisitNights(value);
    calculateCosts();
  };

  const handleNumPeopleChange = async (value: number) => {
    setVisitPeople(value);
    calculateCosts();
  };

  const handleExternalServiceChange = async (value: number) => {
    setVisitExternalService(value);
    calculateCosts();
  };

  const handleMoradaChange = async (value: string) => {
    setVisitMorada(value);
  };

  const handleCPostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('📮 TechnicalVisit - Postal code changed:', value);
    setVisitCPostal(value);
  };

  const handleCPostalKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('⌨️ TechnicalVisit - Enter pressed with postal code:', visit_c_postal);
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
                    (updates.externalServiceCost ?? visit_external_service);
    
    setVisitTotalCost(newTotal || 0);
    if (onTotalCostChange) {
      onTotalCostChange(newTotal || 0);
    }
  };

  // Function to clear all form fields
  const clearForm = () => {
    setVisitDays(1);
    setVisitNights(1);
    setVisitPeople(1);
    setVisitDayHours(0);
    setVisitNightHours(0);
    setVisitKilometers(0);
    setVisitAccommodation(false);
    setVisitMeals(0);
    setVisitExternalService(0);
    setVisitMorada('');
    setVisitCPostal('');
    setDaytimeCost(0);
    setNighttimeCost(0);
    setKmCost(0);
    setAccommodationCost(0);
    setMealsCost(0);
    setVisitTotalCost(0);
    
    if (onTotalCostChange) {
      onTotalCostChange(0);
    }
  };

  // Helper function to ensure costs are numeric
  const formatCost = (cost: number): number => {
    const numericCost = Number(cost);
    return isNaN(numericCost) ? 0 : numericCost;
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getFormData: () => ({
      visit_days,
      visit_nights,
      visit_people,
      visit_day_hours,
      visit_night_hours,
      visit_kilometers,
      visit_accommodation,
      visit_meals,
      visit_external_service,
      visit_morada,
      visit_c_postal,
      visit_total_cost
    }),
    clearForm
  }));

  return (
    <Card 
      title="VISITA TÉCNICA" 
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
          value={visit_accommodation ? 'external' : 'internal'} 
          onChange={(value) => {
            if (value === 'external') {
              setVisitAccommodation(true);
            } else {
              setVisitAccommodation(false);
            }
          }} 
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithCost 
            label="Nº Dias" 
            value={visit_days} 
            onChange={handleNumDaysChange} 
            min={1} 
          />
          <InputWithCost 
            label="Nº Noites" 
            value={visit_nights} 
            onChange={handleNumNightsChange}
          />
          <InputWithCost 
            label="Nº Pessoas" 
            value={visit_people} 
            onChange={handleNumPeopleChange}
            min={1} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithCost 
            label="Nº Horas Dia" 
            value={visit_day_hours} 
            onChange={handleDayHoursChange} 
            cost={daytimeCost} 
          />
          <InputWithCost 
            label="Nº Horas Noite" 
            value={visit_night_hours} 
            onChange={handleNightHoursChange} 
            cost={nighttimeCost} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-200">Morada</label>
            <input
              type="text"
              value={visit_morada}
              onChange={(e) => handleMoradaChange(e.target.value)}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-200">C. Postal</label>
            <input
              type="text"
              value={visit_c_postal}
              onChange={handleCPostalChange}
              onKeyDown={handleCPostalKeyDown}
              placeholder="0000-000"
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="visit_kilometers">Kms</Label>
            <Input
              type="number"
              id="visit_kilometers"
              value={visit_kilometers}
              onChange={(e) => handleKilometersChange(Number(e.target.value))}
              readOnly
            />
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="visit_accommodation">Tipo de Hospedagem</Label>
            <AccommodationToggle 
              value={visit_accommodation} 
              onChange={handleAccommodationChange} 
              cost={accommodationCost} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWithCost 
            label="Nº Refeições" 
            value={visit_meals} 
            onChange={handleNumMealsChange} 
            cost={mealsCost} 
            min={0} 
          />
        </div>

        <ExternalService 
          value={visit_external_service} 
          onChange={handleExternalServiceChange} 
        />

        <TotalCostDisplay totalCost={visit_total_cost} />
      </div>
    </Card>
  );
});
