/**
 * Calculation functions for nighttime hours
 */
import { getNighttimeRates } from './rates';

/**
 * Calculate the cost for nighttime hours
 * 
 * Logic based on the rate_values table:
 * 1 hour = minimum_night (250)
 * 2 hours = minimum_night (250) + NHorasNoturnaVL (75) = 325
 * 3-4 hours = minimum_night (250) + NHorasNoturnaVL (75) * 2 = 400
 * 5 hours = minimum_night (250) + NHorasNoturnaVL (75) * 3 = 475
 * 6 hours = minimum_night (250) + NHorasNoturnaVL (75) * 4 = 550
 * 7-8 hours = minimum_night (250) + NHorasNoturnaVL (75) * 5 = 625
 */
export async function calculateNighttimeHoursCost(hours: number, numPeople: number): Promise<number> {
  try {
    // Convert to number to ensure correct calculation
    const hoursNum = Number(hours);
    const peopleNum = Number(numPeople);
    
    if (isNaN(hoursNum) || isNaN(peopleNum)) {
      console.error(`Invalid input: hours=${hours}, numPeople=${numPeople}`);
      throw new Error('Hours and number of people must be valid numbers');
    }
    
    console.log(`Starting nighttime cost calculation for ${hoursNum} hours and ${peopleNum} people...`);
    
    const rates = await getNighttimeRates();
    console.log('Retrieved nighttime rates from database:', rates);

    // Validate that we have all required rates
    if (!rates.minimum_night || !rates.NHorasNoturnaVL) {
      const missingRates = [];
      if (!rates.minimum_night) missingRates.push('minimum_night');
      if (!rates.NHorasNoturnaVL) missingRates.push('NHorasNoturnaVL');
      
      console.error('Missing required rate values:', missingRates);
      throw new Error(`Missing required rate values for nighttime calculation: ${missingRates.join(', ')}`);
    }

    let baseCost = 0;
    
    // Apply the exact rules from the table
    console.log(`Applying rate rules for ${hoursNum} hours...`);
    
    // Round to nearest whole number for switch cases
    const roundedHours = Math.round(hoursNum);
    
    switch(roundedHours) {
      case 1:
        console.log(`1 hour: Using minimum_night rate of ${rates.minimum_night}`);
        baseCost = rates.minimum_night;
        break;
      case 2:
        console.log(`2 hours: Using minimum_night (${rates.minimum_night}) + NHorasNoturnaVL (${rates.NHorasNoturnaVL})`);
        baseCost = rates.minimum_night + rates.NHorasNoturnaVL;
        break;
      case 3:
        console.log(`3 hours: Using minimum_night (${rates.minimum_night}) + NHorasNoturnaVL*2 (${rates.NHorasNoturnaVL * 2})`);
        baseCost = rates.minimum_night + (rates.NHorasNoturnaVL * 2);
        break;
      case 4:
        console.log(`4 hours: Using minimum_night (${rates.minimum_night}) + NHorasNoturnaVL*3 (${rates.NHorasNoturnaVL * 3})`);
        baseCost = rates.minimum_night + (rates.NHorasNoturnaVL * 3);
        break;
      case 5:
        console.log(`5 hours: Using minimum_night (${rates.minimum_night}) + NHorasNoturnaVL*4 (${rates.NHorasNoturnaVL * 4})`);
        baseCost = rates.minimum_night + (rates.NHorasNoturnaVL * 4);
        break;
      case 6:
        console.log(`6 hours: Using minimum_night (${rates.minimum_night}) + NHorasNoturnaVL*5 (${rates.NHorasNoturnaVL * 5})`);
        baseCost = rates.minimum_night + (rates.NHorasNoturnaVL * 5);
        break;
      case 7:
      case 8:
        console.log(`7-8 hours: Using minimum_night (${rates.minimum_night}) + NHorasNoturnaVL*6 (${rates.NHorasNoturnaVL * 6})`);
        baseCost = rates.minimum_night + (rates.NHorasNoturnaVL * 6);
        break;
      default:
        if (roundedHours > 8) {
          console.log(`More than 8 hours: Using minimum_night (${rates.minimum_night}) + NHorasNoturnaVL*6 (${rates.NHorasNoturnaVL * 6})`);
          baseCost = rates.minimum_night + (rates.NHorasNoturnaVL * 6);
        } else {
          console.log(`Less than 1 hour: Using minimum_night rate of ${rates.minimum_night}`);
          baseCost = rates.minimum_night;
        }
    }

    console.log(`Base cost calculated: ${baseCost}`);
    const totalCost = baseCost * peopleNum;
    console.log(`Final cost after applying number of people (${peopleNum}): ${totalCost}€`);
    
    return totalCost;
  } catch (error) {
    console.error('Error calculating nighttime hours cost:', error);
    throw error;
  }
}
