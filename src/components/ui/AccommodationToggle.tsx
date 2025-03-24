"use client";
import React from 'react';

interface AccommodationToggleProps {
  value: boolean;
  onChange: (value: boolean) => void;
  cost?: number | null;
  disabled?: boolean;
}

export const AccommodationToggle: React.FC<AccommodationToggleProps> = ({
  value,
  onChange,
  cost = 0,
  disabled = false,
}) => {
  // Ensure cost is a number
  const displayCost = cost || 0;
  
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">Estadia</label>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="accommodation"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded text-orange-500 focus:ring-orange-500 focus:ring-opacity-50 border-gray-700 bg-gray-800"
          />
          <label htmlFor="accommodation" className="ml-2 text-sm text-gray-200">
            Incluir estadia
          </label>
        </div>
        <div className="text-sm font-medium text-orange-400">
          €{displayCost.toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  );
};
