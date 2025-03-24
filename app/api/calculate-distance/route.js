// API endpoint for distance calculation
import { NextResponse } from 'next/server';
import { calculateDistance } from '../../../test-route';

export async function POST(request) {
  console.log('🚀 API endpoint called: /api/calculate-distance - UPDATED VERSION');
  
  try {
    const { postalCode } = await request.json();
    
    if (!postalCode) {
      console.log('❌ Missing postal code in request');
      return NextResponse.json(
        { error: 'Postal code is required' },
        { status: 400 }
      );
    }

    console.log('📍 Calculating distance for postal code:', postalCode);
    const distance = await calculateDistance(postalCode);
    console.log('✅ Distance calculated:', distance, 'km');
    
    return NextResponse.json({ 
      distance,
      kilometers: distance,
      version: 'updated'
    });
  } catch (error) {
    console.error('❌ Error calculating distance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
} 