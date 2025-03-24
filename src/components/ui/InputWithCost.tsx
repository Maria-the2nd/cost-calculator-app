"use client";
import React from 'react';

interface InputWithCostProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  cost?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
}

export const InputWithCost: React.FC<InputWithCostProps> = ({
  label,
  value,
  onChange,
  cost = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  readOnly = false,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            readOnly={readOnly}
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-orange-400">
                {cost > 0 ? `€${cost.toFixed(2)}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
