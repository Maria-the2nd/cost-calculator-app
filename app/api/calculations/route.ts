import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CalculationRequest {
  // Client Information
  client_name?: string;
  phc_id?: string;
  contact_name?: string;

  // Technical Visit Fields
  locationType?: string;
  numDays?: number;
  numNights?: number;
  numPeople?: number;
  daytimeHours?: number;
  nighttimeHours?: number;
  kilometers?: number;
  hasAccommodation?: boolean;
  numMeals?: number;
  externalServiceCost?: number;
  clientId?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CalculationRequest;
    console.log('TECHNICAL VISIT CALCULATION REQUEST:', JSON.stringify(body, null, 2));

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
    const {
      numDays = 0,
      numNights = 0,
      numPeople = 1,
      daytimeHours = 0,
      nighttimeHours = 0,
      kilometers = 0,
      hasAccommodation = false,
      numMeals = 0,
      externalServiceCost = 0
    } = body;

    // Calculate daytime cost - using exact number of people
    let daytimeCost = 0;
    if (daytimeHours > 0 && numDays > 0) {
      const hourlyRate = getRateValue('NHorasDiurnasVL');
      daytimeCost = daytimeHours * hourlyRate * numPeople * numDays;
    }

    // Calculate nighttime cost - using exact number of people
    let nighttimeCost = 0;
    if (nighttimeHours > 0 && numNights > 0) {
      const hourlyRate = getRateValue('NHorasNoturnaVL');
      nighttimeCost = nighttimeHours * hourlyRate * numPeople * numNights;
    }

    // Calculate kilometer cost
    let kmCost = 0;
    if (kilometers > 0) {
      const kmRate = getRateValue('KmVL');
      kmCost = kilometers * kmRate;
    }

    // Calculate accommodation cost - using rounded up number of people
    let accommodationCost = 0;
    if (hasAccommodation) {
      const accommodationRate = getRateValue('EstadiaVL');
      const roundedPeople = Math.ceil(numPeople);
      const effectiveNights = Math.max(numNights, 1); // At least 1 night if accommodation is needed
      accommodationCost = accommodationRate * roundedPeople * effectiveNights;
    }

    // Calculate meals cost - using rounded up number of people
    let mealsCost = 0;
    if (numMeals > 0) {
      const mealRate = getRateValue('NRefeicaoVL');
      const roundedPeople = Math.ceil(numPeople);
      const totalDays = numDays + numNights;
      mealsCost = mealRate * roundedPeople * numMeals * totalDays;
    }

    // Calculate total cost
    const totalCost = daytimeCost + nighttimeCost + kmCost + accommodationCost + mealsCost + externalServiceCost;

    const results = {
      daytimeCost,
      nighttimeCost,
      kmCost,
      accommodationCost,
      mealsCost,
      totalCost
    };

    console.log('TECHNICAL VISIT CALCULATION RESULTS:', JSON.stringify(results, null, 2));

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('TECHNICAL VISIT CALCULATION ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
