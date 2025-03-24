"use client";
import React, { useState, useRef } from 'react';
import { TechnicalVisitForm } from '@/components/forms/TechnicalVisitForm';
import { ImplementationForm } from '@/components/forms/ImplementationForm';
import { ClientInfoForm } from '@/components/forms/ClientInfoForm';
import { FormContainer, MobileFormContainer, DesktopFormContainer } from '@/components/ui/FormContainer';

interface ProjectResponse {
  success: boolean;
  projectId?: string;
  message?: string;
  error?: string;
}

export default function Home() {
  const [technicalVisitCost, setTechnicalVisitCost] = useState(0);
  const [implementationCost, setImplementationCost] = useState(0);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientName, setClientName] = useState<string>('');
  const [phcId, setPhcId] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs to access form data
  const technicalVisitFormRef = useRef<any>(null);
  const implementationFormRef = useRef<any>(null);

  const totalProjectCost = technicalVisitCost + implementationCost;

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const resetForms = () => {
    // Reset form values using the refs
    if (technicalVisitFormRef.current?.clearForm) {
      technicalVisitFormRef.current.clearForm();
    }
    
    if (implementationFormRef.current?.clearForm) {
      implementationFormRef.current.clearForm();
    }
    
    // Reset costs
    setTechnicalVisitCost(0);
    setImplementationCost(0);
  };

  const createProject = async () => {
    if (!clientName || !phcId) {
      setErrorMessage('Por favor, preencha o nome do cliente e o PHC ID antes de prosseguir.');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      // Get form data from refs
      const visitFormData = technicalVisitFormRef.current?.getFormData() || {
        locationType: 'internal',
        numDays: 1, 
        numNights: 0,
        numPeople: 1,
        daytimeHours: 0,
        nighttimeHours: 0,
        kilometers: 0,
        hasAccommodation: false,
        numMeals: 0,
        externalServiceCost: 0,
        visitMorada: '',
        visitCPostal: ''
      };

      const implFormData = implementationFormRef.current?.getFormData() || {
        locationType: 'internal',
        numDays: 1,
        numNights: 0,
        numPeople: 1,
        daytimeHours: 0,
        nighttimeHours: 0,
        kilometers: 0,
        hasAccommodation: false,
        numMeals: 0,
        externalServiceCost: 0,
        implMorada: '',
        implCPostal: ''
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Client info
          clientId, // Still send this for reference
          clientName,
          phcId,
          contactName,
          
          // Technical visit data
          visitMorada: visitFormData.visitMorada,
          visitCPostal: visitFormData.visitCPostal,
          visitDays: visitFormData.numDays,
          visitNights: visitFormData.numNights,
          visitPeople: visitFormData.numPeople,
          visitDaytimeHours: visitFormData.daytimeHours,
          visitNighttimeHours: visitFormData.nighttimeHours,
          visitKilometers: visitFormData.kilometers,
          visitAccommodation: visitFormData.hasAccommodation,
          visitMeals: visitFormData.numMeals,
          visitExternalService: visitFormData.externalServiceCost,
          visitTotalCost: technicalVisitCost,
          
          // Implementation data
          implMorada: implFormData.implMorada,
          implCPostal: implFormData.implCPostal,
          implDays: implFormData.numDays,
          implNights: implFormData.numNights,
          implPeople: implFormData.numPeople,
          implDaytimeHours: implFormData.daytimeHours,
          implNighttimeHours: implFormData.nighttimeHours,
          implKilometers: implFormData.kilometers,
          implAccommodation: implFormData.hasAccommodation,
          implMeals: implFormData.numMeals,
          implExternalService: implFormData.externalServiceCost,
          implTotalCost: implementationCost,
          
          // Total project cost
          projectTotalCost: totalProjectCost
        }),
      });

      const result = await response.json() as ProjectResponse;
      
      if (result.success) {
        setSuccessMessage(`Projeto criado com sucesso! ID: ${result.projectId}`);
        // Reset forms after successful project creation
        resetForms();
      } else {
        setErrorMessage(`Erro ao criar projeto: ${result.error}`);
      }
    } catch (error: any) {
      setErrorMessage(`Erro ao criar projeto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientData = (id: string | null, name?: string, phc?: string, contact?: string) => {
    setClientId(id);
    if (name) setClientName(name);
    if (phc) setPhcId(phc);
    if (contact) setContactName(contact);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-orange-500">Calculadora de Custos</h1>
          <p className="text-gray-400 mt-1">Calcule custos de visitas técnicas e implementações</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Client Information */}
        <ClientInfoForm onClientSelect={handleClientData} />
      
        {/* Mobile View - Stacked */}
        <div className="block md:hidden">
          <div className="space-y-6">
            <TechnicalVisitForm ref={technicalVisitFormRef} collapsible={true} onTotalCostChange={setTechnicalVisitCost} clientId={clientId} />
            <ImplementationForm ref={implementationFormRef} collapsible={true} defaultCollapsed={true} onTotalCostChange={setImplementationCost} clientId={clientId} />
          </div>
        </div>
        
        {/* Desktop View - Side by Side */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TechnicalVisitForm ref={technicalVisitFormRef} onTotalCostChange={setTechnicalVisitCost} clientId={clientId} />
            <ImplementationForm ref={implementationFormRef} onTotalCostChange={setImplementationCost} clientId={clientId} />
          </div>
        </div>
        
        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-orange-500 mb-4">Custo Total do Projeto</h2>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="space-y-2 mb-4 md:mb-0">
              <p className="text-gray-300">Visita Técnica + Implementação</p>
              <p className="text-sm text-gray-400">Inclui todos os custos calculados acima</p>
            </div>
            <div className="text-3xl font-bold text-orange-500">
              {totalProjectCost.toLocaleString('en-DE', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
            <div className="w-full sm:w-auto mb-4 sm:mb-0">
              {successMessage && (
                <div className="px-4 py-2 rounded-lg bg-green-800 text-green-100">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="px-4 py-2 rounded-lg bg-red-800 text-red-100">
                  {errorMessage}
                </div>
              )}
            </div>
            <button
              onClick={createProject}
              disabled={isLoading || !clientId}
              className="w-full sm:w-auto px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>{isLoading ? 'A guardar projeto...' : 'Guardar Projeto na Base de Dados'}</span>
            </button>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-900 border-t border-gray-800 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-gray-400 text-center">© 2025 Calculadora de Custos</p>
        </div>
      </footer>
    </div>
  );
}
