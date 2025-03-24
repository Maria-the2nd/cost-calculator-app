"use client";
import React from 'react';

interface ClientInfoInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
}

export const ClientInfoInput: React.FC<ClientInfoInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  maxLength,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}; 