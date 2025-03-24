/**
 * Calculation functions for accommodation cost
 */
import { AccommodationParams } from './types';
import { getOtherRates } from './rates';

/**
 * Calculate the cost for accommodation based on the EstadiaVL rate from the database
 */
export async function calculateAccommodationCost({ 
  hasAccommodation, 
  nights, 
  people, 
  days 
}: AccommodationParams): Promise<number> {
  // If no accommodation is needed, return 0
  if (!hasAccommodation || nights === 0) {
    return 0;
  }
  
  // Get rates from Supabase - no try/catch to force errors to bubble up
  const rates = await getOtherRates();
  
  // Get the accommodation rate from the database using the EXACT field name
  const accommodationRate = rates['EstadiaVL'];
  
  console.log('Using accommodation rate from database:', { accommodationRate });
  
  // Ensure we have valid accommodation rate
  if (!accommodationRate) {
    throw new Error('Missing required EstadiaVL rate value');
  }
  
  // Calculate for whole and fractional people
  const wholePersons = Math.floor(people);
  const fractionalPerson = people - wholePersons;
  
  // Calculate base value per night
  const baseValue = accommodationRate * nights;
  
  // Calculate for all people
  const calculatedValue = (baseValue * wholePersons) + (baseValue * fractionalPerson);
  
  console.log(`Calculated accommodation cost for ${nights} nights, ${people} people: ${calculatedValue}€`);
  
  return calculatedValue;
}
