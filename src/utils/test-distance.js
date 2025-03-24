"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ORIGIN_ADDRESS = 'Estrada de S. Marcos, nº 11, 2735-521 Cacém';
const API_KEY = 'AIzaSyDjcIn9k0AxNkWvL9hRDf4LJcJi17i3LAY';

async function testDistanceCalculator() {
    try {
        console.log('🔍 Starting distance calculator test...');
        
        // Test postal codes
        const testCases = [
            '2735-521',  // Cacém (origin)
            '1000-001',  // Lisboa
            '4000-001',  // Porto
            '8000-001',  // Faro
        ];

        for (const postalCode of testCases) {
            console.log(`\n📍 Testing postal code: ${postalCode}`);
            try {
                // Format the destination
                const destination = `${postalCode}, Portugal`;

                // First, geocode the postal code
                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${API_KEY}`;
                const geocodeResponse = await fetch(geocodeUrl);
                const geocodeData = await geocodeResponse.json();

                if (!geocodeData.results || geocodeData.results.length === 0) {
                    throw new Error('Could not geocode the postal code');
                }

                // Calculate distance using Distance Matrix
                const distanceUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(ORIGIN_ADDRESS)}&destinations=${encodeURIComponent(geocodeData.results[0].formatted_address)}&mode=driving&key=${API_KEY}`;
                const distanceResponse = await fetch(distanceUrl);
                const distanceData = await distanceResponse.json();

                if (distanceData.rows[0].elements[0].status === 'OK') {
                    const distanceInKm = distanceData.rows[0].elements[0].distance.value / 1000;
                    console.log(`✅ Distance calculated: ${distanceInKm.toFixed(1)} km`);
                    console.log(`📍 From: ${ORIGIN_ADDRESS}`);
                    console.log(`📍 To: ${geocodeData.results[0].formatted_address}`);
                } else {
                    throw new Error('Distance calculation failed');
                }
            } catch (err) {
                console.error(`❌ Error calculating distance for ${postalCode}:`, err.message);
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testDistanceCalculator();
