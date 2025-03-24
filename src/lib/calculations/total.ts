/**
 * Calculation functions for total cost
 */
import { TotalCalculationParams } from './types';

/**
 * Calculate the total cost by summing all individual costs
 * 
 * Logic:
 * - Sum all individual costs (daytime, nighttime, km, accommodation, meals, external service)
 */
export function calculateTotalCost({ 
  daytimeCost, 
  nighttimeCost, 
  kmCost, 
  accommodationCost, 
  mealsCost, 
  externalServiceCost 
}: TotalCalculationParams): number {
  return daytimeCost + 
         nighttimeCost + 
         kmCost + 
         accommodationCost + 
         mealsCost + 
         externalServiceCost;
}
