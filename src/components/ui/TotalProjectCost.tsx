"use client";
import React from 'react';
import { formatCurrency } from '@/lib/formatting';

interface TotalProjectCostProps {
  technicalVisitCost: number;
  implementationCost: number;
}

export const TotalProjectCost: React.FC<TotalProjectCostProps> = ({
  technicalVisitCost,
  implementationCost
}) => {
  const totalCost = technicalVisitCost + implementationCost;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
      <h3 className="text-xl font-medium text-white">Custo Total do Projeto</h3>
      
      <div className="text-sm text-gray-300">
        Visita Técnica + Implementação
      </div>
      
      <div className="text-xs text-gray-400">
        Inclui todos os custos calculados acima
      </div>
      
      <div className="text-3xl font-bold text-orange-500">
        {formatCurrency(totalCost)}
      </div>
    </div>
  );
};
