"use client";
import React from 'react';

interface TotalCostDisplayProps {
  totalCost: number | null;
}

export function TotalCostDisplay({ totalCost }: TotalCostDisplayProps) {
  // Format the total cost, defaulting to 0 if null/undefined
  const formattedCost = (totalCost || 0).toFixed(2);

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="text-sm font-medium text-gray-300">Custo Total</div>
      <div className="text-2xl font-bold text-orange-500">
        €{formattedCost}
      </div>
    </div>
  );
}
