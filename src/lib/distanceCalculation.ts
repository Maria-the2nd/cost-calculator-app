// Google Maps Distance Matrix API integration
// This would be used in a real implementation to calculate driving distance

export interface DistanceCalculationResult {
  distance: number; // in kilometers
  duration: number; // in seconds
  status: 'OK' | 'ZERO_RESULTS' | 'ERROR';
  error?: string;
}

// Fixed origin location as specified in requirements
const ORIGIN_ADDRESS = "Estrada de S. Marcos, nº 11 2735-521 Cacém";

export async function calculateDistance(
  destinationAddress: string,
  destinationPostalCode: string
): Promise<DistanceCalculationResult> {
  try {
    // In a real implementation, this would call the Google Maps API
    // For demonstration purposes, we're simulating the API call
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Parse the postal code to generate a realistic distance
    // This is just for demonstration - in production this would use the actual Google Maps API
    const postalCodeNumber = parseInt(destinationPostalCode.replace(/[^0-9]/g, '')) || 0;
    
    // Generate a distance based on postal code difference from origin
    // Origin postal code is 2735-521
    const originPostalCode = 2735521;
    const postalCodeDiff = Math.abs(postalCodeNumber - originPostalCode);
    
    // Calculate a somewhat realistic distance (1 unit ≈ 0.1 km)
    let distance = (postalCodeDiff / 100) + (Math.random() * 10);
    
    // Ensure minimum distance and round to one decimal place
    distance = Math.max(2.5, distance);
    distance = Math.round(distance * 10) / 10;
    
    // Calculate an estimated duration (roughly 1 minute per km)
    const duration = Math.round(distance * 60);
    
    return {
      distance,
      duration,
      status: 'OK'
    };
  } catch (error) {
    console.error('Error calculating distance:', error);
    return {
      distance: 0,
      duration: 0,
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to format the full address
export function formatFullAddress(address: string, postalCode: string): string {
  if (!address && !postalCode) return '';
  
  if (!address) return postalCode;
  if (!postalCode) return address;
  
  return `${address}, ${postalCode}`;
}
