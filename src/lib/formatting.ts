// Update the TechnicalVisitForm and ImplementationForm to use the distance calculation module
import { calculateDistance, formatFullAddress } from '@/lib/distanceCalculation';

// Update the InputWithCost component to use Euro currency format
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('pt-PT', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Format date to European format (DD/MM/YYYY)
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Parse European format date string (DD/MM/YYYY) to Date object
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  
  return new Date(year, month, day);
};
