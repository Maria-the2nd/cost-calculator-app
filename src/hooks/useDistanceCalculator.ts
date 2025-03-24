import { useState, useCallback } from 'react';
import { DistanceCalculator } from '@/utils/distanceCalculator';

export const useDistanceCalculator = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = useCallback(async (postalCode: string): Promise<number> => {
    setIsCalculating(true);
    setError(null);

    try {
      const calculator = DistanceCalculator.getInstance();
      const distance = await calculator.calculateDistance(postalCode);
      return distance;
    } catch (err) {
      setError('Erro ao calcular a distância. Por favor, verifique o código postal.');
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return {
    calculateDistance,
    isCalculating,
    error
  };
}; 