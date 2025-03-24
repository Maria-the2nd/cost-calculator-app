"use client";
import React from 'react';

interface LocationTypeProps {
  value: 'internal' | 'external';
  onChange: (value: 'internal' | 'external') => void;
  disabled?: boolean;
}

export const LocationType: React.FC<LocationTypeProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  // Keep the functionality but hide the component visually
  return (
    <input
      type="hidden"
      name="locationType"
      value={value}
      onChange={() => {}} // Empty onChange handler since we're hiding it
      data-testid="location-type-hidden"
    />
  );
};
