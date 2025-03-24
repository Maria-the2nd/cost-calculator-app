import { useState } from 'react';

/**
 * Custom hook to manage postal code and distance calculation state
 * This hook provides the necessary state and handlers for postal code distance calculation
 * 
 * @param initialPostalCode - The initial postal code value
 * @param initialDistance - The initial distance value
 * @returns An object with postal code, distance, and handlers
 */
export function usePostalCodeDistance(initialPostalCode: string = '', initialDistance: number = 0) {
  const [postalCode, setPostalCode] = useState<string>(initialPostalCode);
  const [distance, setDistance] = useState<number>(initialDistance);
  
  /**
   * Handle distance calculation updates
   * Updates the internal distance state and dispatches a custom event with the new values
   * 
   * @param calculatedDistance - The newly calculated distance
   */
  const handleDistanceCalculated = (calculatedDistance: number) => {
    setDistance(calculatedDistance);
    
    // Dispatch a custom event for other components that might need to react to distance changes
    const event = new CustomEvent('distanceCalculated', {
      detail: {
        distance: calculatedDistance,
        postalCode
      }
    });
    
    document.dispatchEvent(event);
    
    console.log('Distance calculated:', calculatedDistance, 'km for', postalCode);
  };
  
  /**
   * Handle postal code changes
   * Updates the internal postal code state
   * 
   * @param newPostalCode - The new postal code value
   */
  const handlePostalCodeChange = (newPostalCode: string) => {
    setPostalCode(newPostalCode);
  };
  
  return {
    postalCode,
    distance,
    handlePostalCodeChange,
    handleDistanceCalculated,
    setPostalCode, // Expose setter for direct updates
  };
} 