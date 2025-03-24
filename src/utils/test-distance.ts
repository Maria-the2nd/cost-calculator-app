const ORIGIN_ADDRESS = 'Estrada de S. Marcos, nº 11, 2735-521 Cacém';
const API_KEY = 'AIzaSyDjcIn9k0AxNkWvL9hRDf4LJcJi17i3LAY';

// Import the required Google Maps services
import { Client } from '@googlemaps/google-maps-services-js';

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

    const client = new Client({});

    for (const postalCode of testCases) {
      console.log(`\n📍 Testing postal code: ${postalCode}`);
      try {
        // Format the destination
        const destination = `${postalCode}, Portugal`;

        // First, geocode the postal code
        const geocodeResponse = await client.geocode({
          params: {
            address: destination,
            key: API_KEY
          }
        });

        if (geocodeResponse.data.results.length === 0) {
          throw new Error('Could not geocode the postal code');
        }

        // Calculate distance using Distance Matrix
        const distanceResponse = await client.distancematrix({
          params: {
            origins: [ORIGIN_ADDRESS],
            destinations: [geocodeResponse.data.results[0].formatted_address],
            mode: 'driving',
            key: API_KEY
          }
        });

        if (distanceResponse.data.rows[0].elements[0].status === 'OK') {
          const distanceInKm = distanceResponse.data.rows[0].elements[0].distance.value / 1000;
          console.log(`✅ Distance calculated: ${distanceInKm.toFixed(1)} km`);
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