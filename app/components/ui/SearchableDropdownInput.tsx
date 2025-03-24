"use client";
import React, { useState, useRef, useEffect } from 'react';

interface SearchOption {
  id: string;
  label: string;
  description?: string;
}

interface SearchableDropdownInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: SearchOption) => void;
  options: SearchOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export const SearchableDropdownInput: React.FC<SearchableDropdownInputProps> = ({
  label,
  value,
  onChange,
  onSelect,
  options,
  placeholder = '',
  required = false,
  disabled = false,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug log for props
  useEffect(() => {
    console.log('SearchableDropdownInput props:', { value, options, isOpen, loading });
  }, [value, options, isOpen, loading]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setIsOpen(true);
    console.log('Input changed, opening dropdown');
  };

  const handleOptionClick = (option: SearchOption) => {
    console.log('Option clicked:', option);
    if (onSelect) {
      onSelect(option);
    } else {
      onChange(option.label);
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    console.log('Toggling dropdown, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={handleInputChange}
              onFocus={() => {
                console.log('Input focused, opening dropdown');
                setIsOpen(true);
              }}
              placeholder={placeholder}
              required={required}
              disabled={disabled}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                onClick={toggleDropdown}
                className="text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md bg-gray-800 border border-gray-700 shadow-lg">
            {loading ? (
              <div className="py-2 px-3 text-sm text-gray-400">Carregando...</div>
            ) : options.length > 0 ? (
              <ul className="py-1 max-h-60 overflow-auto">
                {options.map((option) => (
                  <li 
                    key={option.id}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-700"
                    onClick={() => handleOptionClick(option)}
                  >
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-gray-400">{option.description}</div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-2 px-3 text-sm text-gray-400">Nenhum resultado encontrado</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 