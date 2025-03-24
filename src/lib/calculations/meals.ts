/**
 * Calculation functions for meals cost
 */
import { MealsParams } from './types';
import { getOtherRates } from './rates';

/**
 * Calculate the cost for meals based on the NRefeicaoVL rate from the database
 */
export async function calculateMealsCost({ 
  meals, 
  people, 
  days = 1 
}: MealsParams): Promise<number> {
  if (meals === 0) return 0;
  
  // Get rates from Supabase - no try/catch to force errors to bubble up
  const rates = await getOtherRates();
  
  // Get the meal rate from the database using the EXACT field name
  const mealRate = rates['NRefeicaoVL'];
  
  console.log('Using meal rate from database:', { mealRate });
  
  // Ensure we have valid meal rate
  if (!mealRate) {
    throw new Error('Missing required NRefeicaoVL rate value');
  }
  
  // Calculate for whole and fractional people
  const wholePersons = Math.floor(people);
  const fractionalPerson = people - wholePersons;
  
  // Calculate base value per meal
  const baseValue = meals * mealRate;
  
  // Calculate for all people
  const calculatedValue = (baseValue * wholePersons) + (baseValue * fractionalPerson);
  
  // Multiply by days 
  const finalCost = calculatedValue * days;
  console.log(`Calculated meals cost for ${meals} meals, ${people} people, ${days} days: ${finalCost}€`);
  
  return finalCost;
}
