/**
 * Updates the kilometers field based on postal code input
 * @param {string} postalCode - Portuguese postal code
 * @returns {Promise<number>} - Distance in kilometers
 */
export async function fetchDistance(postalCode) {
  if (!postalCode || postalCode.trim() === '') {
    return 0;
  }
  
  try {
    const response = await fetch('/api/calculate-distance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ postalCode }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error calculating distance:', errorData);
      return 0;
    }
    
    const data = await response.json();
    return data.kilometers;
  } catch (error) {
    console.error('Failed to fetch distance:', error);
    return 0;
  }
} 