// Google Maps API script loader
// This utility helps load the Google Maps API script only once

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

// Google Maps API Key from environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Define required libraries
const REQUIRED_LIBRARIES = ['places', 'geometry', 'directions', 'distance_matrix'];

export function loadMapsApi(): Promise<void> {
  // If already loaded, return resolved promise
  if (isLoaded) {
    return Promise.resolve();
  }

  // If already loading, return the existing promise
  if (loadPromise) {
    return loadPromise;
  }

  // Create and execute the loading promise
  loadPromise = new Promise<void>((resolve, reject) => {
    try {
      // Create callback function that will be called when Google Maps API is loaded
      window.mapsApiLoaded = () => {
        console.log('Google Maps API loaded successfully');
        isLoaded = true;
        resolve();
      };

      // Create script element
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=${REQUIRED_LIBRARIES.join(',')}&callback=mapsApiLoaded`;
      script.async = true;
      script.defer = true;

      // Handle script load error
      script.onerror = (error) => {
        console.error('Error loading Google Maps API:', error);
        reject(new Error('Failed to load Google Maps API'));
      };

      // Add script to document
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error setting up Google Maps API:', error);
      reject(error);
    }
  });

  return loadPromise;
}

// Function to check if the API is loaded
export function isMapsApiLoaded(): boolean {
  return isLoaded;
} 