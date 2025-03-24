const ORIGIN = 'Estrada de S. Marcos, nº 11, 2735-521 Cacém';
// Use environment variable with fallback for the API key
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDjcIn9k0AxNkWvL9hRDf4LJcJi17i3LAY';

/**
 * Calculate distance between origin and a given postal code
 * @param {string} postalCode - The destination postal code
 * @returns {Promise<number>} - Distance in kilometers
 */
async function calculateDistance(postalCode) {
  try {
    console.log('🔄 Calculating distance for postal code:', postalCode);
    console.log('🔑 API Key (first 10 chars):', API_KEY ? API_KEY.substring(0, 10) + '...' : 'NOT SET');
    
    const destination = `${postalCode}, Portugal`;

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters'
      },
      body: JSON.stringify({
        origin: { address: ORIGIN },
        destination: { address: destination },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        languageCode: "pt-PT"
      })
    });

    const data = await response.json();
    
    if (data.routes?.[0]?.distanceMeters) {
      const distanceInKm = data.routes[0].distanceMeters / 1000;
      return parseFloat(distanceInKm.toFixed(1));
    } else {
      console.error('No distance data in response:', data);
      return 0;
    }
  } catch (error) {
    console.error('Error calculating distance:', error.message);
    return 0;
  }
}

// For direct CLI usage
if (require.main === module) {
  const cliPostalCode = process.argv[2] || '2430-141';
  
  calculateDistance(cliPostalCode).then(distance => {
    console.log(`Distance: ${distance} km`);
  });
}

module.exports = { calculateDistance }; 