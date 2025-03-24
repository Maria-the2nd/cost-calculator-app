import { supabase } from '../supabase';

export interface Rate {
  id: string;
  description: string;
  value: number;
  currency: string;
  is_current: boolean;
}

export async function getDaytimeRates() {
  console.log('Getting daytime rates from database...');
  
  // Get daytime rates
  const { data: daytimeRates, error } = await supabase
    .from('rate_values')
    .select('description, value')
    .in('description', ['minimum_day', 'NHorasDiurnasVL', '1periodoDia', '1Dia']);
  
  console.log('Daytime rates query result:', { daytimeRates, error });
  
  if (error) {
    console.error('Error fetching daytime rates:', error);
    throw error;
  }
  
  if (!daytimeRates || daytimeRates.length === 0) {
    console.error('No daytime rates found in database');
    throw new Error('No daytime rates found in database');
  }
  
  // Transform into object
  const rates: Record<string, number> = {};
  
  daytimeRates.forEach(rate => {
    rates[rate.description] = rate.value;
    console.log(`Setting daytime rate: ${rate.description} = ${rate.value}`);
  });
  
  // Check if all rates are present
  const requiredRates = ['minimum_day', 'NHorasDiurnasVL', '1periodoDia', '1Dia'];
  const missingRates = requiredRates.filter(rate => rates[rate] === undefined);
  
  if (missingRates.length > 0) {
    console.error(`Missing required daytime rates: ${missingRates.join(', ')}`);
    throw new Error(`Missing required daytime rates: ${missingRates.join(', ')}`);
  }
  
  console.log('Final daytime rates:', rates);
  return rates;
}

export async function getNighttimeRates() {
  console.log('Getting nighttime rates from database...');
  
  // Get nighttime rates
  const { data: nighttimeRates, error } = await supabase
    .from('rate_values')
    .select('description, value')
    .in('description', ['minimum_night', 'NHorasNoturnaVL']);
  
  console.log('Nighttime rates query result:', { nighttimeRates, error });
  
  if (error) {
    console.error('Error fetching nighttime rates:', error);
    throw error;
  }
  
  if (!nighttimeRates || nighttimeRates.length === 0) {
    console.error('No nighttime rates found in database');
    throw new Error('No nighttime rates found in database');
  }
  
  // Transform into object
  const rates: Record<string, number> = {};
  
  nighttimeRates.forEach(rate => {
    rates[rate.description] = rate.value;
    console.log(`Setting nighttime rate: ${rate.description} = ${rate.value}`);
  });
  
  // Check if all rates are present
  const requiredRates = ['minimum_night', 'NHorasNoturnaVL'];
  const missingRates = requiredRates.filter(rate => rates[rate] === undefined);
  
  if (missingRates.length > 0) {
    console.error(`Missing required nighttime rates: ${missingRates.join(', ')}`);
    throw new Error(`Missing required nighttime rates: ${missingRates.join(', ')}`);
  }
  
  console.log('Final nighttime rates:', rates);
  return rates;
}

export async function getOtherRates() {
  console.log('Fetching other rates from Supabase...');
  
  const { data, error } = await supabase
    .from('rate_values')
    .select('description, value')
    .in('description', ['KmVL', 'EstadiaVL', 'NRefeicaoVL']);

  if (error) {
    console.error('Error fetching other rates:', error);
    throw error;
  }

  console.log('Raw other rate values from database:', data);
  console.log('Number of other rates found:', data?.length || 0);

  if (!data || data.length === 0) {
    console.error('No other rate values found in database');
    throw new Error('No rate values found in the rate_values table for other rates');
  }

  const result = {
    kmCost: data.find(r => r.description === 'KmVL')?.value,
    accommodationCost: data.find(r => r.description === 'EstadiaVL')?.value,
    mealsCost: data.find(r => r.description === 'NRefeicaoVL')?.value
  };

  // Check if all rates are present
  if (result.kmCost === undefined) {
    console.error('Missing rate: KmVL');
    throw new Error('Missing required rate: KmVL');
  }
  
  if (result.accommodationCost === undefined) {
    console.error('Missing rate: EstadiaVL');
    throw new Error('Missing required rate: EstadiaVL');
  }
  
  if (result.mealsCost === undefined) {
    console.error('Missing rate: NRefeicaoVL');
    throw new Error('Missing required rate: NRefeicaoVL');
  }

  console.log('Final other rates object:', result);
  return result;
}

export async function getRateValues() {
  console.log('Fetching all rate values...');
  
  const [daytimeRates, nighttimeRates, otherRates] = await Promise.all([
    getDaytimeRates(),
    getNighttimeRates(),
    getOtherRates()
  ]);

  const result = {
    ...daytimeRates,
    ...nighttimeRates,
    ...otherRates
  };

  console.log('All rate values combined:', result);
  return result;
}

export async function getKilometerRates() {
  console.log('Getting kilometer rates from database...');
  
  // Get kilometer rates
  const { data: kmRates, error } = await supabase
    .from('rate_values')
    .select('description, value')
    .eq('description', 'kmsVL');
  
  console.log('Kilometer rates query result:', { kmRates, error });
  
  if (error) {
    console.error('Error fetching kilometer rates:', error);
    throw error;
  }
  
  if (!kmRates || kmRates.length === 0) {
    console.error('No kilometer rates found in database');
    throw new Error('No kilometer rates found in database');
  }
  
  // Transform into object
  const rates: Record<string, number> = {};
  
  kmRates.forEach(rate => {
    rates[rate.description] = rate.value;
    console.log(`Setting kilometer rate: ${rate.description} = ${rate.value}`);
  });
  
  // Check if rate is present
  if (rates['kmsVL'] === undefined) {
    console.error('Missing kilometer rate: kmsVL');
    throw new Error('Missing required rate: kmsVL');
  }
  
  console.log('Final kilometer rates:', rates);
  return rates;
}

export async function getMealRates() {
  console.log('Getting meal rates from database...');
  
  // Get meal rates
  const { data: mealRates, error } = await supabase
    .from('rate_values')
    .select('description, value')
    .eq('description', 'alimentacao');
  
  console.log('Meal rates query result:', { mealRates, error });
  
  if (error) {
    console.error('Error fetching meal rates:', error);
    throw error;
  }
  
  if (!mealRates || mealRates.length === 0) {
    console.error('No meal rates found in database');
    throw new Error('No meal rates found in database');
  }
  
  // Transform into object
  const rates: Record<string, number> = {};
  
  mealRates.forEach(rate => {
    rates[rate.description] = rate.value;
    console.log(`Setting meal rate: ${rate.description} = ${rate.value}`);
  });
  
  // Check if rate is present
  if (rates['alimentacao'] === undefined) {
    console.error('Missing meal rate: alimentacao');
    throw new Error('Missing required rate: alimentacao');
  }
  
  console.log('Final meal rates:', rates);
  return rates;
}

export async function getAccommodationRates() {
  console.log('Getting accommodation rates from database...');
  
  // Get accommodation rates
  const { data: accommodationRates, error } = await supabase
    .from('rate_values')
    .select('description, value')
    .eq('description', 'alojamento');
  
  console.log('Accommodation rates query result:', { accommodationRates, error });
  
  if (error) {
    console.error('Error fetching accommodation rates:', error);
    throw error;
  }
  
  if (!accommodationRates || accommodationRates.length === 0) {
    console.error('No accommodation rates found in database');
    throw new Error('No accommodation rates found in database');
  }
  
  // Transform into object
  const rates: Record<string, number> = {};
  
  accommodationRates.forEach(rate => {
    rates[rate.description] = rate.value;
    console.log(`Setting accommodation rate: ${rate.description} = ${rate.value}`);
  });
  
  // Check if rate is present
  if (rates['alojamento'] === undefined) {
    console.error('Missing accommodation rate: alojamento');
    throw new Error('Missing required rate: alojamento');
  }
  
  console.log('Final accommodation rates:', rates);
  return rates;
} 