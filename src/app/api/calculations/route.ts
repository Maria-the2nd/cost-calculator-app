import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface CalculationRequest {
  // Client Information
  clientId?: string | null;

  // Form Fields
  locationType?: 'internal' | 'external';
  numDays?: number;
  numNights?: number;
  numPeople?: number;
  daytimeHours?: number;
  nighttimeHours?: number;
  kilometers?: number;
  hasAccommodation?: boolean;
  numMeals?: number;
  externalServiceCost?: number;
  visitMorada?: string;
  visitCPostal?: string;
}

export async function POST(request: NextRequest) {
  try {
    const {
      locationType = 'internal',
      numDays = 1,
      numNights = 0,
      numPeople = 1,
      daytimeHours = 0,
      nighttimeHours = 0,
      kilometers = 0,
      hasAccommodation = false,
      numMeals = 0,
      externalServiceCost = 0,
      clientId = null
    } = await request.json() as CalculationRequest;

    console.log('TECHNICAL VISIT CALCULATION REQUEST:', {
      locationType,
      numDays,
      numNights,
      numPeople,
      daytimeHours,
      nighttimeHours,
      kilometers,
      hasAccommodation,
      numMeals,
      externalServiceCost,
      clientId
    });

    // Get rates from the database
    const { data: rates, error: ratesError } = await supabase
      .from('rates')
      .select('*')
      .single();

    if (ratesError) {
      throw new Error('Error fetching rates: ' + ratesError.message);
    }

    const getRateValue = (rateName: string): number => {
      return rates[rateName] || 0;
    };

    // Calculate costs based on hours
    let daytimeCost = 0;
    let nighttimeCost = 0;
    let kmCost = 0;
    let accommodationCost = 0;
    let mealsCost = 0;

    // Calculate daytime cost
    if (daytimeHours > 0) {
      const daytimeRate = getRateValue('HoraDiaVL');
      daytimeCost = daytimeRate * numPeople * daytimeHours * numDays;
    }

    // Calculate nighttime cost
    if (nighttimeHours > 0) {
      const nighttimeRate = getRateValue('HoraNoiteVL');
      nighttimeCost = nighttimeRate * numPeople * nighttimeHours * numNights;
    }

    // Calculate kilometers cost
    if (kilometers > 0) {
      const kmRate = getRateValue('KmVL');
      kmCost = kmRate * kilometers;
    }

    // Calculate accommodation cost
    if (hasAccommodation) {
      const accommodationRate = getRateValue('AlojamentoVL');
      accommodationCost = accommodationRate * numPeople * numNights;
    }

    // Calculate meals cost
    if (numMeals > 0) {
      const mealRate = getRateValue('NRefeicaoVL');
      mealsCost = mealRate * numPeople * numMeals * (numDays + numNights);
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

    console.log('TECHNICAL VISIT CALCULATION RESULTS:', results);

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
