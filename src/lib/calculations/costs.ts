import { getRateValues } from './rates';

export async function calculateDaytimeHoursCost(hours: number, numberOfPeople: number) {
  const rates = await getRateValues();
  const { daytimeRate, minimumDayCost, onePeriodDayCost, oneDayCost } = rates;

  let cost = 0;

  // Calculate cost based on hours
  if (hours <= 2) {
    cost = minimumDayCost;
  } else if (hours <= 4) {
    cost = onePeriodDayCost;
  } else if (hours <= 8) {
    cost = oneDayCost;
  } else {
    // More than 8 hours: base cost plus hourly rate for additional hours
    const additionalHours = hours - 8;
    cost = oneDayCost + (additionalHours * daytimeRate);
  }

  // Multiply by number of people
  return cost * numberOfPeople;
}

export async function calculateNighttimeHoursCost(hours: number, numberOfPeople: number) {
  const rates = await getRateValues();
  const { nighttimeRate, minimumNightCost } = rates;

  let cost = 0;

  // For nighttime, we always use the hourly rate, with a minimum cost
  cost = Math.max(hours * nighttimeRate, minimumNightCost);

  // Multiply by number of people
  return cost * numberOfPeople;
}

export async function calculateKilometersCost(kilometers: number) {
  const rates = await getRateValues();
  return kilometers * rates.kmCost;
}

export async function calculateAccommodationCost(numberOfPeople: number, numberOfNights: number) {
  const rates = await getRateValues();
  return rates.accommodationCost * numberOfPeople * numberOfNights;
}

export async function calculateMealsCost(numberOfPeople: number, numberOfMeals: number) {
  const rates = await getRateValues();
  return rates.mealsCost * numberOfPeople * numberOfMeals;
} 