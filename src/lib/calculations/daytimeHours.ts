/**
 * Calculation functions for daytime hours
 */
import { getDaytimeRates } from './rates';

/**
 * Calculate the cost for daytime hours
 * 
 * Logic based on the rate_values table:
 * 1 hour = minimum_day (100)
 * 2 hours = minimum_day (100) + NHorasDiurnasVL (50) = 150
 * 3-4 hours = 1periodoDia (250)
 * 5 hours = 1periodoDia (250) + NHorasDiurnasVL (50) = 300
 * 6 hours = 1periodoDia (250) + NHorasDiurnasVL (50) * 2 = 350
 * 7-8 hours = 1Dia (500)
 */
export async function calculateDaytimeHoursCost(hours: number, numPeople: number): Promise<number> {
  try {
    // Convert to number to ensure correct calculation
    const hoursNum = Number(hours);
    const peopleNum = Number(numPeople);
    
    if (isNaN(hoursNum) || isNaN(peopleNum)) {
      console.error(`Invalid input: hours=${hours}, numPeople=${numPeople}`);
      throw new Error('Hours and number of people must be valid numbers');
    }
    
    console.log(`Starting daytime cost calculation for ${hoursNum} hours and ${peopleNum} people...`);
    
    const rates = await getDaytimeRates();
    console.log('Retrieved daytime rates from database:', rates);

    // Validate that we have all required rates
    if (!rates.minimum_day || !rates.NHorasDiurnasVL || !rates['1periodoDia'] || !rates['1Dia']) {
      const missingRates = [];
      if (!rates.minimum_day) missingRates.push('minimum_day');
      if (!rates.NHorasDiurnasVL) missingRates.push('NHorasDiurnasVL');
      if (!rates['1periodoDia']) missingRates.push('1periodoDia');
      if (!rates['1Dia']) missingRates.push('1Dia');
      
      console.error('Missing required rate values:', missingRates);
      throw new Error(`Missing required rate values for daytime calculation: ${missingRates.join(', ')}`);
    }

    let baseCost = 0;
    
    // Apply the exact rules from the table
    console.log(`Applying rate rules for ${hoursNum} hours...`);
    
    // Round to nearest whole number for switch cases
    const roundedHours = Math.round(hoursNum);
    
    switch(roundedHours) {
      case 1:
        console.log(`1 hour: Using minimum_day rate of ${rates.minimum_day}`);
        baseCost = rates.minimum_day;
        break;
      case 2:
        console.log(`2 hours: Using minimum_day (${rates.minimum_day}) + NHorasDiurnasVL (${rates.NHorasDiurnasVL})`);
        baseCost = rates.minimum_day + rates.NHorasDiurnasVL;
        break;
      case 3:
      case 4:
        console.log(`3-4 hours: Using 1periodoDia rate of ${rates['1periodoDia']}`);
        baseCost = rates['1periodoDia'];
        break;
      case 5:
        console.log(`5 hours: Using 1periodoDia (${rates['1periodoDia']}) + NHorasDiurnasVL (${rates.NHorasDiurnasVL})`);
        baseCost = rates['1periodoDia'] + rates.NHorasDiurnasVL;
        break;
      case 6:
        console.log(`6 hours: Using 1periodoDia (${rates['1periodoDia']}) + NHorasDiurnasVL * 2 (${rates.NHorasDiurnasVL * 2})`);
        baseCost = rates['1periodoDia'] + (rates.NHorasDiurnasVL * 2);
        break;
      case 7:
      case 8:
        console.log(`7-8 hours: Using 1Dia rate of ${rates['1Dia']}`);
        baseCost = rates['1Dia'];
        break;
      default:
        if (roundedHours > 8) {
          console.log(`More than 8 hours: Using 1Dia rate of ${rates['1Dia']}`);
          baseCost = rates['1Dia'];
        } else {
          console.log(`Less than 1 hour: Using minimum_day rate of ${rates.minimum_day}`);
          baseCost = rates.minimum_day;
        }
    }

    console.log(`Base cost calculated: ${baseCost}`);
    const totalCost = baseCost * peopleNum;
    console.log(`Final cost after applying number of people (${peopleNum}): ${totalCost}€`);
    
    return totalCost;
  } catch (error) {
    console.error('Error calculating daytime hours cost:', error);
    throw error;
  }
}

// Helper function to find a rate value from multiple possible keys - no default value
function findRateValue(rates: Record<string, number>, possibleKeys: string[]): number | undefined {
  for (const key of possibleKeys) {
    if (rates[key] !== undefined) {
      return rates[key];
    }
  }
  return undefined;
}
