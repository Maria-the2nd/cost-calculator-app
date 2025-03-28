// API endpoint for distance calculation
import { NextResponse } from 'next/server';
// Import the distance calculation function from our Vercel-specific config
import { calculateDistance } from '../../../vercel-maps-config';

export async function POST(request) {
  console.log('🚀 API endpoint called: /api/calculate-distance - LATEST VERSION FOR VERCEL');
  
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
      version: 'vercel-2024'
    });
  } catch (error) {
    console.error('❌ Error calculating distance:', error);
    return NextResponse.json(
      { error: 'Failed to calculate distance' },
      { status: 500 }
    );
  }
} 