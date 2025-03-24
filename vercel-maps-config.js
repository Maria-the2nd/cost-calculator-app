// Google Maps API configuration for Vercel deployment
console.log('Initializing Google Maps API configuration for Vercel...');

// The API key - either from environment or fallback
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyDjcIn9k0AxNkWvL9hRDf4LJcJi17i3LAY';
const ORIGIN_ADDRESS = 'Estrada de S. Marcos, nº 11, 2735-521 Cacém';

// Function to calculate distance
async function calculateDistance(postalCode) {
  try {
    console.log('🔄 Calculating distance for postal code:', postalCode);
    console.log('🔑 API Key (first 10 chars):', GOOGLE_MAPS_API_KEY ? GOOGLE_MAPS_API_KEY.substring(0, 10) + '...' : 'NOT SET');
    
    const destination = `${postalCode}, Portugal`;

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'routes.distanceMeters'
      },
      body: JSON.stringify({
        origin: { address: ORIGIN_ADDRESS },
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

// Export values and functions
module.exports = { 
  GOOGLE_MAPS_API_KEY,
  ORIGIN_ADDRESS,
  calculateDistance,
  vercelDeploymentTimestamp: new Date().toISOString()
}; 