"use client";
import React from 'react';

interface FormContainerProps {
  children: React.ReactNode;
}

export const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  );
};

export const MobileFormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return (
    <div className="flex flex-col space-y-6 md:hidden">
      {children}
    </div>
  );
};

export const DesktopFormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return (
    <div className="hidden md:grid md:grid-cols-2 gap-6">
      {children}
    </div>
  );
};
