/**
 * Types for calculation functions
 */

export interface BaseCalculationParams {
  people: number;
  days: number;
}

export interface DaytimeHoursParams extends BaseCalculationParams {
  hours: number;
}

export interface NighttimeHoursParams {
  hours: number;
  people: number;
  days: number;
}

export interface KilometersParams extends BaseCalculationParams {
  kilometers: number;
}

export interface AccommodationParams extends BaseCalculationParams {
  hasAccommodation: boolean;
  nights: number;
}

export interface MealsParams extends BaseCalculationParams {
  meals: number;
}

export interface TotalCalculationParams {
  daytimeCost: number;
  nighttimeCost: number;
  kmCost: number;
  accommodationCost: number;
  mealsCost: number;
  externalServiceCost: number;
}

export interface CalculationRates {
  hourlyDaytimeRate: number;
  hourlyNighttimeRate: number;
  periodDaytimeRate: number;
  periodNighttimeRate: number;
  kmRate: number;
  accommodationRate: number;
  mealRate: number;
}
