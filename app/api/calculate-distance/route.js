// API endpoint for distance calculation
import { NextResponse } from 'next/server';
import { DistanceCalculator } from '@/utils/distanceCalculator';

export async function POST(request) {
  console.log('API endpoint called: /api/calculate-distance');
  
  try {
    const { postalCode } = await request.json();
    
    if (!postalCode) {
      return NextResponse.json(
        { error: 'Postal code is required' },
        { status: 400 }
      );
    }

    const calculator = new DistanceCalculator();
    const distance = await calculator.calculateDistance(postalCode);
    
    return NextResponse.json({ 
      distance,
      kilometers: distance
    });
  } catch (error) {
    console.error('Error calculating distance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
} 