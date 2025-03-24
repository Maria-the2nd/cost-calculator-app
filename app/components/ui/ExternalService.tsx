"use client";
import React from 'react';

interface ExternalServiceProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const ExternalService: React.FC<ExternalServiceProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">Serviço Externo</label>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-400">€</span>
          </div>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
            disabled={disabled}
            className="w-full rounded-lg bg-gray-800 pl-10 pr-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};
