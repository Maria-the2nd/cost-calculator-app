"use client";
import React, { useState } from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  collapsible = false,
  defaultCollapsed = false,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {collapsible && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 text-gray-300 transition-transform ${
                collapsed ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>
      <div
        className={`px-4 py-4 transition-all duration-300 ease-in-out ${
          collapsed ? 'max-h-0 py-0 overflow-hidden opacity-0' : 'max-h-[2000px] opacity-100'
        }`}
      >
        {children}
      </div>
    </div>
  );
};
