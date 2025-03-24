/**
 * Calculation functions for kilometers cost
 */
import { getOtherRates } from './rates';

/**
 * Calculate the cost for kilometers based on the KmVL rate from the database
 */
export async function calculateKilometersCost(kilometers: number): Promise<number> {
  try {
    // Return 0 if no kilometers to calculate
    if (kilometers === 0) {
      return 0;
    }
    
    const rates = await getOtherRates();
    
    if (!rates.kmCost) {
      throw new Error('Kilometer rate not found in database');
    }
    
    const totalCost = kilometers * rates.kmCost;
    console.log(`Calculated kilometers cost for ${kilometers}km: ${totalCost}€`);
    return totalCost;
  } catch (error) {
    console.error('Error calculating kilometers cost:', error);
    throw error;
  }
}
