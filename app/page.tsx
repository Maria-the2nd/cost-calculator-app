"use client";
import React, { useState, useRef, useEffect } from 'react';
import { TechnicalVisitForm } from './components/forms/TechnicalVisitForm';
import { ImplementationForm } from './components/forms/ImplementationForm';
import { ClientInfoForm } from './components/forms/ClientInfoForm';
import { supabase } from '@/lib/supabase';
import { ProjectSelectionPanel } from './components/ProjectSelectionPanel';

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
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Project search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{id: string, name: string, company_name: string}>>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null);
  
  // Ref for click outside handling
  const searchDropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowProjectDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchDropdownRef]);

  // Add ref for ClientInfoForm
  const clientInfoFormRef = useRef<{ resetForm: () => void } | null>(null);

  // Refs to access form data
  const technicalVisitFormRef = useRef<any>(null);
  const implementationFormRef = useRef<any>(null);

  const totalProjectCost = technicalVisitCost + implementationCost;

  // Search for projects when the search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchProjects();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Function to search for projects
  const searchProjects = async () => {
    setSearchLoading(true);
    try {
      console.log(`Searching for projects matching "${searchTerm}"...`);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, 
          name,
          company_id,
          companies (
            id,
            company_name,
            phc_number
          ),
          implementations(id, project_name)
        `)
        .ilike('name', `%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      console.log('Search results:', data);
      
      if (data) {
        const formattedResults = data.map(project => {
          // Safely handle nested data structure
          const companyData = project.companies;
          console.log(`Project: ${project.name}, Company: ${companyData?.company_name}`);
            
          return {
            id: project.id,
            name: project.name,
            company_name: companyData?.company_name || 'Empresa Desconhecida'
          };
        });
        
        setSearchResults(formattedResults);
        setShowProjectDropdown(true);
      }
    } catch (error) {
      console.error('Error searching projects:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const resetForms = () => {
    // Reset client info form
    if (clientInfoFormRef.current?.resetForm) {
      clientInfoFormRef.current.resetForm();
    }
    
    // Reset other forms
    if (technicalVisitFormRef.current?.clearForm) {
      technicalVisitFormRef.current.clearForm();
    }
    
    if (implementationFormRef.current?.clearForm) {
      implementationFormRef.current.clearForm();
    }
    
    // Reset state variables
    setTechnicalVisitCost(0);
    setImplementationCost(0);
    setClientId(null);
    setClientName('');
    setPhcId('');
    setContactName('');
    setProjectName('');
  };

  const handleNewProject = () => {
    // Call resetForms to clear all form data including client info
    resetForms();
    setLoadedProjectId(null);
    setSearchTerm(''); // Clear the search term
    
    // Ensure client info is properly reset
    if (clientInfoFormRef.current?.resetForm) {
      clientInfoFormRef.current.resetForm();
    }
  };

  const handleProjectSelect = async (projectId: string) => {
    setIsLoading(true);
    clearMessages();
    
    try {
      console.log("Loading project with ID:", projectId);
      
      // Fetch project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          id, 
          name,
          company_id,
          companies (
            id,
            company_name,
            phc_number
          ),
          contact_id,
          contacts (
            id,
            contact_name
          )
        `)
        .eq('id', projectId)
        .single();
      
      if (projectError) throw projectError;
      console.log("Loaded project data:", project);
      
      // Fetch implementation details
      const { data: implementation, error: implError } = await supabase
        .from('implementations')
        .select('*, project_name')
        .eq('project_id', projectId)
        .single();
      
      if (implError && implError.code !== 'PGRST116') { // Not found is okay
        throw implError;
      }
      
      console.log("Loaded implementation:", implementation);
      console.log("Project name from project:", project?.name);
      console.log("Project name from implementation:", implementation?.project_name);
      
      // ALWAYS set the project name - prioritize implementation.project_name if available
      if (implementation && implementation.project_name) {
        console.log("Setting project name from implementation:", implementation.project_name);
        setProjectName(implementation.project_name);
      } else if (project && project.name) {
        console.log("Setting project name from project:", project.name);
        setProjectName(project.name);
      }
      
      // Force an update on the clientInfoForm
      if (clientInfoFormRef.current) {
        // Force a manual update of the project name in the form
        setTimeout(() => {
          if (implementation?.project_name) {
            handleProjectNameChange(implementation.project_name);
          } else if (project?.name) {
            handleProjectNameChange(project.name);
          }
        }, 100);
      }
      
      // Access nested company data
      if (project.companies) {
        const company = typeof project.companies === 'object' ? project.companies : null;
        if (company) {
          setClientId(company.id);
          setClientName(company.company_name);
          setPhcId(company.phc_number);
          
          // Update client info in the form
          if (clientInfoFormRef.current?.resetForm) {
            // First reset the form
            clientInfoFormRef.current.resetForm();
            
            // Then set the selected company in the form
            if (clientInfoFormRef.current.setSelectedCompany) {
              clientInfoFormRef.current.setSelectedCompany({
                id: company.id,
                company_name: company.company_name,
                phc_number: company.phc_number
              });
            }
          }
        }
      }
      
      // Access nested contact data
      if (project.contacts) {
        const contact = typeof project.contacts === 'object' ? project.contacts : null;
        if (contact) {
          setContactName(contact.contact_name);
          
          // Set contact in form if the function exists
          if (clientInfoFormRef.current?.setSelectedContact) {
            clientInfoFormRef.current.setSelectedContact({
              id: contact.id,
              company_id: project.company_id,
              contact_name: contact.contact_name
            });
          }
        }
      }
      
      // Set loaded project ID
      setLoadedProjectId(projectId);
      
      // Load implementation data into the forms
      if (implementation) {
        if (technicalVisitFormRef.current?.setFormData) {
          technicalVisitFormRef.current.setFormData({
            locationType: implementation.location_type || 'internal',
            numDays: implementation.visit_days || 1,
            numNights: implementation.visit_nights || 0,
            numPeople: implementation.visit_people || 1,
            daytimeHours: implementation.visit_daytime_hours || 0,
            nighttimeHours: implementation.visit_nighttime_hours || 0,
            kilometers: implementation.visit_kilometers || 0,
            hasAccommodation: implementation.visit_accommodation || false,
            numMeals: implementation.visit_meals || 0,
            externalServiceCost: implementation.visit_external_service || 0,
            visitMorada: implementation.visit_address || '',
            visitCPostal: implementation.visit_postal_code || ''
          });
        }
        
        if (implementationFormRef.current?.setFormData) {
          implementationFormRef.current.setFormData({
            locationType: implementation.location_type || 'internal',
            numDays: implementation.num_days || 1,
            numNights: implementation.num_nights || 0,
            numPeople: implementation.num_people || 1,
            daytimeHours: implementation.daytime_hours || 0,
            nighttimeHours: implementation.nighttime_hours || 0,
            kilometers: implementation.kilometers || 0,
            hasAccommodation: implementation.has_accommodation || false,
            numMeals: implementation.num_meals || 0,
            externalServiceCost: implementation.external_service_cost || 0,
            implMorada: implementation.address || '',
            implCPostal: implementation.postal_code || ''
          });
        }
        
        // Set costs
        setTechnicalVisitCost(implementation.visit_total_cost || 0);
        setImplementationCost(implementation.total_cost || 0);
      }
    } catch (error: any) {
      console.error('Error loading project:', error);
      setErrorMessage('Error loading project: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const createProject = async () => {
    if (!clientName) {
      setErrorMessage('Por favor, selecione um cliente antes de prosseguir.');
      return;
    }

    if (!projectName) {
      setErrorMessage('Por favor, defina um nome para o projeto.');
      return;
    }

    setIsLoading(true);
    clearMessages();

    try {
      // Check if we're updating an existing project or creating a new one
      const isUpdating = loadedProjectId !== null;
      console.log(`${isUpdating ? 'Updating' : 'Creating'} project with client data:`, { 
        clientId, 
        clientName, 
        phcId, 
        contactName,
        projectId: loadedProjectId 
      });
      
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

      // Get calculated costs from technical visit form
      const visitCosts = technicalVisitFormRef.current?.getCosts ? 
        technicalVisitFormRef.current.getCosts() : {
          daytimeCost: 0,
          nighttimeCost: 0,
          kmCost: 0,
          accommodationCost: 0,
          mealsCost: 0
        };

      // Get calculated costs from implementation form  
      const implCosts = implementationFormRef.current?.getCosts ?
        implementationFormRef.current.getCosts() : {
          daytimeCost: 0,
          nighttimeCost: 0,
          kmCost: 0,
          accommodationCost: 0,
          mealsCost: 0
        };

      const projectData = {
        projectId: loadedProjectId || undefined, // Include project ID if updating
        clientId: clientId || '', // Send empty string if null
        clientName,
        phcId: phcId || '',  // Send empty string if null
        contactName: contactName || '',  // Send empty string if null
        projectName,
        
        visitMorada: visitFormData.visitMorada || '',
        visitCPostal: visitFormData.visitCPostal || '',
        visitDays: visitFormData.numDays || 0,
        visitNights: visitFormData.numNights || 0,
        visitPeople: visitFormData.numPeople || 0,
        visitDaytimeHours: visitFormData.daytimeHours || 0,
        visitNighttimeHours: visitFormData.nighttimeHours || 0,
        visitKilometers: visitFormData.kilometers || 0,
        visitAccommodation: visitFormData.hasAccommodation || false,
        visitMeals: visitFormData.numMeals || 0,
        visitExternalService: visitFormData.externalServiceCost || 0,
        visitTotalCost: technicalVisitCost || 0,
        
        // Visit cost breakdown
        visitDaytimeCost: visitCosts.daytimeCost || 0,
        visitNighttimeCost: visitCosts.nighttimeCost || 0,
        visitKmCost: visitCosts.kmCost || 0,
        visitAccommodationCost: visitCosts.accommodationCost || 0,
        visitMealsCost: visitCosts.mealsCost || 0,
        
        implMorada: implFormData.implMorada || '',
        implCPostal: implFormData.implCPostal || '',
        implDays: implFormData.numDays || 0,
        implNights: implFormData.numNights || 0,
        implPeople: implFormData.numPeople || 0,
        implDaytimeHours: implFormData.daytimeHours || 0,
        implNighttimeHours: implFormData.nighttimeHours || 0,
        implKilometers: implFormData.kilometers || 0,
        implAccommodation: implFormData.hasAccommodation || false,
        implMeals: implFormData.numMeals || 0,
        implExternalService: implFormData.externalServiceCost || 0,
        implTotalCost: implementationCost || 0,
        
        // Implementation cost breakdown
        implDaytimeCost: implCosts.daytimeCost || 0,
        implNighttimeCost: implCosts.nighttimeCost || 0,
        implKmCost: implCosts.kmCost || 0,
        implAccommodationCost: implCosts.accommodationCost || 0,
        implMealsCost: implCosts.mealsCost || 0,
        
        projectTotalCost: totalProjectCost || 0
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      console.log('API response received');
      const result = await response.json() as ProjectResponse;
      console.log('API result:', result);
      
      if (result.success) {
        setSuccessMessage(`Projeto ${isUpdating ? 'atualizado' : 'criado'} com sucesso! ID: ${result.projectId}`);
        resetForms();
      } else {
        setErrorMessage(`Erro ao ${isUpdating ? 'atualizar' : 'criar'} projeto: ${result.error}`);
      }
    } catch (error: any) {
      console.error(`Error ${loadedProjectId ? 'updating' : 'creating'} project:`, error);
      setErrorMessage(`Erro ao ${loadedProjectId ? 'atualizar' : 'criar'} projeto: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientData = (companyId: string, companyName: string, contactId: string | null) => {
    console.log('handleClientData called with:', { companyId, companyName, contactId });
    
    // Explicitly set the client ID
    setClientId(companyId || null);
    setClientName(companyName || '');
    
    // Get the company details to set PHC ID
    if (companyId) {
      console.log('Fetching company details for ID:', companyId);
      supabase
        .from('companies')
        .select('phc_number')
        .eq('id', companyId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            console.log('Setting PHC ID:', data.phc_number);
            setPhcId(data.phc_number);
          } else if (error) {
            console.error('Error fetching company details:', error);
          }
        });
    }
    
    // Get contact name if contactId is provided
    if (contactId) {
      console.log('Fetching contact details for ID:', contactId);
      supabase
        .from('contacts')
        .select('contact_name')
        .eq('id', contactId)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            console.log('Setting contact name:', data.contact_name);
            setContactName(data.contact_name);
          } else if (error) {
            console.error('Error fetching contact details:', error);
          }
        });
    } else {
      setContactName('');
    }
  };

  const handleProjectNameChange = (projectName: string) => {
    setProjectName(projectName);
  };

  // At the top of the component, add a useEffect for logging
  useEffect(() => {
    console.log('Current state:', { 
      clientId, 
      clientName, 
      phcId, 
      projectName, 
      buttonDisabled: isLoading || !clientId || !projectName 
    });
  }, [clientId, clientName, phcId, projectName, isLoading]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-orange-500">Calculadora de Custos</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-400 mt-1">Calcule custos de visitas técnicas e implementações</p>
            <div className="px-3 py-1 bg-green-800 text-white rounded text-xs font-bold">VERSÃO JULHO 2024 FINAL</div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Calculadora de Custos</h1>
          <div className="text-xs text-gray-500">Versão: Julho 2024 (Rev. 2 - LATEST UPDATE)</div>
        </div>
        
        {/* Simple Project Search and New Project button */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-orange-500">Gestão de Projetos</h2>
            <div className="flex gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-64" ref={searchDropdownRef}>
                <input
                  type="text"
                  placeholder="Pesquisar projeto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setShowProjectDropdown(true)}
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                />
                
                {/* Project search dropdown */}
                {showProjectDropdown && searchTerm.length >= 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-gray-400">A pesquisar...</div>
                    ) : searchResults.length > 0 ? (
                      <ul>
                        {searchResults.map((project) => (
                          <li
                            key={project.id}
                            onClick={() => {
                              handleProjectSelect(project.id);
                              setSearchTerm('');
                              setShowProjectDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="text-white font-medium">{project.name}</span>
                              <span className="text-gray-400 text-sm">{project.company_name}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-4 text-gray-400">
                        Nenhum projeto encontrado
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={handleNewProject}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Novo Projeto
              </button>
            </div>
          </div>
        </div>
        
        {/* Original Client Information Form */}
        <div className="mb-8">
          <ClientInfoForm 
            ref={clientInfoFormRef}
            onClientSelect={handleClientData} 
            onProjectNameChange={handleProjectNameChange}
            projectName={projectName}
          />
        </div>

        {/* Original Calculation Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TechnicalVisitForm 
            ref={technicalVisitFormRef} 
            onTotalCostChange={setTechnicalVisitCost} 
            clientId={clientId} 
          />
          <ImplementationForm 
            ref={implementationFormRef} 
            onTotalCostChange={setImplementationCost} 
            clientId={clientId} 
          />
        </div>

        <div className="mt-8 bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-semibold text-orange-500">Custo Total do Projeto</h3>
              <p className="text-3xl font-bold mt-2">€{totalProjectCost.toFixed(2)}</p>
            </div>
            
            <button
              onClick={createProject}
              disabled={isLoading || (!clientId && !clientName)}
              className="w-full sm:w-auto px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>{isLoading ? 'A guardar projeto...' : loadedProjectId ? 'Atualizar Projeto na Base de Dados' : 'Guardar Projeto na Base de Dados'}</span>
            </button>
          </div>
          
          {successMessage && (
            <div className="mt-4 p-4 bg-green-800 text-green-100 rounded-lg">{successMessage}</div>
          )}
          
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-800 text-red-100 rounded-lg">{errorMessage}</div>
          )}
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