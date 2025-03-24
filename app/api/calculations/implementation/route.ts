import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CalculationRequest {
  // Client Information
  client_name?: string;
  phc_id?: string;
  contact_name?: string;

  // Implementation Fields
  locationType?: string; 
  numDays?: number;
  numNights?: number;
  numPeople?: number;
  daytimeHours?: number;
  nighttimeHours?: number;
  kilometers?: number;
  impl_days?: number;
  impl_nights?: number;
  impl_people?: number;
  impl_day_hours?: number;
  impl_night_hours?: number;
  impl_kilometers?: number;
  impl_accommodation?: boolean;
  impl_meals?: number;
  impl_external_service?: number;
  impl_morada?: string;
  impl_c_postal?: string;
  hasAccommodation?: boolean;
  numMeals?: number;
  externalServiceCost?: number;
  clientId?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CalculationRequest;
    console.log('IMPLEMENTATION CALCULATION REQUEST:', JSON.stringify(body, null, 2));

    // Get current rates from database
    const { data: rates, error: ratesError } = await supabase
      .from('rate_values')
      .select('*')
      .eq('is_current', true);

    if (ratesError) {
      throw new Error(`Error fetching rates: ${ratesError.message}`);
    }

    const getRateValue = (description: string) => {
      const rate = rates?.find(r => r.description === description);
      if (!rate) throw new Error(`Rate not found: ${description}`);
      return rate.value;
    };

    // Calculate costs
    // Check if we're using the new field names or old field names
    const days = body.numDays ?? body.impl_days ?? 0;
    const nights = body.numNights ?? body.impl_nights ?? 0;
    const people = body.numPeople ?? body.impl_people ?? 1;
    const dayHours = body.daytimeHours ?? body.impl_day_hours ?? 0;
    const nightHours = body.nighttimeHours ?? body.impl_night_hours ?? 0;
    const kmDistance = body.kilometers ?? body.impl_kilometers ?? 0;
    const hasAccommodation = body.hasAccommodation ?? body.impl_accommodation ?? false;
    const meals = body.numMeals ?? body.impl_meals ?? 0;
    const externalService = body.externalServiceCost ?? body.impl_external_service ?? 0;

    // Calculate daytime cost - using exact number of people
    let daytimeCost = 0;
    if (dayHours > 0 && days > 0) {
      const hourlyRate = getRateValue('NHorasDiurnasVL');
      daytimeCost = dayHours * hourlyRate * people * days;
    }

    // Calculate nighttime cost - using exact number of people
    let nighttimeCost = 0;
    if (nightHours > 0 && nights > 0) {
      const hourlyRate = getRateValue('NHorasNoturnaVL');
      nighttimeCost = nightHours * hourlyRate * people * nights;
    }

    // Calculate kilometer cost
    let kmCost = 0;
    if (kmDistance > 0) {
      const kmRate = getRateValue('KmVL');
      kmCost = kmDistance * kmRate;
    }

    // Calculate accommodation cost - using rounded up number of people
    let accommodationCost = 0;
    if (hasAccommodation) {
      const accommodationRate = getRateValue('EstadiaVL');
      const roundedPeople = Math.ceil(people);
      const effectiveNights = Math.max(nights, 1); // At least 1 night if accommodation is needed
      accommodationCost = accommodationRate * roundedPeople * effectiveNights;
    }

    // Calculate meals cost - using rounded up number of people
    let mealsCost = 0;
    if (meals > 0) {
      const mealRate = getRateValue('NRefeicaoVL');
      const roundedPeople = Math.ceil(people);
      const totalDays = days + nights;
      mealsCost = mealRate * roundedPeople * meals * totalDays;
    }

    // Calculate total cost
    const totalCost = daytimeCost + nighttimeCost + kmCost + accommodationCost + mealsCost + externalService;

    const results = {
      daytimeCost,
      nighttimeCost,
      kmCost,
      accommodationCost,
      mealsCost,
      totalCost
    };

    console.log('IMPLEMENTATION CALCULATION RESULTS:', JSON.stringify(results, null, 2));

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('IMPLEMENTATION CALCULATION ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 