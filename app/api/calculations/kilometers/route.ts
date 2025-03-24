import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kilometers = 0 } = body;
    
    console.log('KILOMETERS CALCULATION REQUEST:', { kilometers });

    if (kilometers <= 0) {
      return NextResponse.json({
        success: true,
        kmCost: 0
      });
    }

    // Get current KmVL rate from database
    const { data: rates, error: ratesError } = await supabase
      .from('rate_values')
      .select('*')
      .eq('is_current', true)
      .eq('description', 'KmVL');

    if (ratesError) {
      throw new Error(`Error fetching KmVL rate: ${ratesError.message}`);
    }

    if (!rates || rates.length === 0) {
      throw new Error('KmVL rate not found in the database');
    }

    const kmRate = rates[0].value;
    const kmCost = kilometers * kmRate;

    console.log('KILOMETERS CALCULATION RESULT:', { 
      kilometers, 
      kmRate, 
      kmCost 
    });

    return NextResponse.json({
      success: true,
      kmCost
    });

  } catch (error) {
    console.error('KILOMETERS CALCULATION ERROR:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 