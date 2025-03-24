// Remove the reference to @types/google.maps since we're not using it
// const ORIGIN = 'Estrada de S. Marcos, nº 11, 2735-521 Cacém';
// const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export class DistanceCalculator {
  private static instance: DistanceCalculator;
  private readonly origin: string = 'Estrada de S. Marcos, nº 11, 2735-521 Cacém';
  private readonly apiKey: string | undefined = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  private constructor() {
    console.log('🔑 Initializing DistanceCalculator with API Key:', this.apiKey?.substring(0, 10) + '...');
  }

  public static getInstance(): DistanceCalculator {
    if (!DistanceCalculator.instance) {
      DistanceCalculator.instance = new DistanceCalculator();
    }
    return DistanceCalculator.instance;
  }

  public async calculateDistance(postalCode: string): Promise<number> {
    try {
      console.log('🚀 Distance calculation started for postal code:', postalCode);
      console.log('🔑 API Key loaded:', this.apiKey ? 'Yes' : 'No');
      console.log('🔑 API Key value:', this.apiKey?.substring(0, 10) + '...');
      
      if (!this.apiKey) {
        console.error('❌ Missing Google Maps API Key');
        throw new Error('Missing Google Maps API Key');
      }

      // Format destination with postal code
      const destination = this.formatDestination(postalCode);
      console.log('📍 Origin:', this.origin);
      console.log('📍 Destination:', destination);

      const requestBody = {
        origin: {
          address: this.origin
        },
        destination: {
          address: destination
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        languageCode: "pt-PT",
        units: "METRIC"
      };

      console.log('🌐 Making API request to Google Routes API...');
      console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));

      const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
      console.log('🔗 API URL:', url);

      const headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
      };
      console.log('📋 Request Headers:', JSON.stringify({
        ...headers,
        'X-Goog-Api-Key': headers['X-Goog-Api-Key']?.substring(0, 10) + '...'
      }, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response Status Text:', response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Google Routes API Error Response:', errorText);
        throw new Error(`Failed to calculate route: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📡 Raw API Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('✅ Parsed API Response:', JSON.stringify(data, null, 2));
      } catch (e) {
        console.error('❌ Failed to parse API response:', e);
        throw new Error('Invalid API response format');
      }

      if (!data.routes?.[0]?.distanceMeters) {
        console.error('❌ No distance data in response:', data);
        throw new Error('No distance data in response');
      }

      // Convert meters to kilometers
      const distanceInKm = data.routes[0].distanceMeters / 1000;
      const roundedDistance = Number(distanceInKm.toFixed(1));
      console.log('✅ Final distance calculated:', roundedDistance, 'km');
      return roundedDistance;
    } catch (error) {
      console.error('❌ Error in distance calculation:', error);
      throw error;
    }
  }

  private formatDestination(postalCode: string): string {
    const cleanPostalCode = postalCode.trim().replace(/\s+/g, '');
    const formattedDestination = `${cleanPostalCode}, Portugal`;
    console.log('🔍 Formatted destination:', formattedDestination);
    return formattedDestination;
  }
} 