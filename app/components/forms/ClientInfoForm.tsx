"use client";
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

interface Company {
  id: string;
  company_name: string;
  phc_number: string;
}

interface Contact {
  id: string;
  company_id: string;
  contact_name: string;
}

interface ClientInfoFormProps {
  onClientSelect: (companyId: string, companyName: string, contactId: string | null) => void;
  onProjectNameChange: (projectName: string) => void;
  projectName?: string;
}

export const ClientInfoForm = forwardRef<{ 
  resetForm: () => void;
  setSelectedCompany: (company: Company) => void;
  setSelectedContact: (contact: Contact) => void;
}, ClientInfoFormProps>(
  ({ onClientSelect, onProjectNameChange, projectName: propProjectName }, ref) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [projectName, setProjectName] = useState(propProjectName || '');
    const [isLoading, setIsLoading] = useState(false);
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);

    // Update internal state when prop changes
    useEffect(() => {
      console.log("propProjectName changed:", propProjectName);
      if (propProjectName !== undefined) {
        console.log("Setting projectName state to:", propProjectName);
        setProjectName(propProjectName);
      }
    }, [propProjectName]);
    
    // Log when projectName state changes
    useEffect(() => {
      console.log("projectName state changed to:", projectName);
    }, [projectName]);

    // Expose methods to the parent
    useImperativeHandle(ref, () => ({
      resetForm: () => {
        setSearchTerm('');
        setSelectedCompany(null);
        setSelectedContact(null);
        setProjectName('');
        setContacts([]);
        setShowCompanyDropdown(false);
        
        // Call parent handlers with empty/null values
        onClientSelect('', '', null);
        onProjectNameChange('');
      },
      setSelectedCompany: (company: Company) => {
        setSelectedCompany(company);
        
        // Fetch contacts for this company
        fetchContacts(company.id);
        
        // Update parent component
        onClientSelect(company.id, company.company_name, null);
      },
      setSelectedContact: (contact: Contact) => {
        setSelectedContact(contact);
        
        // Update parent if there's a company selected
        if (selectedCompany) {
          onClientSelect(selectedCompany.id, selectedCompany.company_name, contact.id);
        }
      }
    }), [onClientSelect, onProjectNameChange, selectedCompany]);

    // Search companies when search term changes
    useEffect(() => {
      if (searchTerm.length >= 2) {
        searchCompanies();
      } else {
        setCompanies([]);
        setShowCompanyDropdown(false);
      }
    }, [searchTerm]);

    // Fetch contacts when company is selected
    useEffect(() => {
      if (selectedCompany) {
        fetchContacts(selectedCompany.id);
      } else {
        setContacts([]);
        setSelectedContact(null);
      }
    }, [selectedCompany]);

    const searchCompanies = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .or(`company_name.ilike.%${searchTerm}%,phc_number.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        setCompanies(data || []);
        setShowCompanyDropdown(true);
      } catch (error) {
        console.error('Error searching companies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchContacts = async (companyId: string) => {
      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('*')
          .eq('company_id', companyId);

        if (error) throw error;
        setContacts(data || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    const handleCompanySelect = (company: Company) => {
      console.log('Selected company:', company);
      setSelectedCompany(company);
      setSearchTerm('');
      setShowCompanyDropdown(false);
      
      // Make sure to pass the company ID properly
      if (company && company.id) {
        // Call onClientSelect here with the company ID
        onClientSelect(company.id, company.company_name, null);
        console.log('Setting client ID:', company.id);
      }
    };

    const handleContactSelect = (contact: Contact) => {
      setSelectedContact(contact);
      if (selectedCompany) {
        onClientSelect(selectedCompany.id, selectedCompany.company_name, contact.id);
      }
    };

    const handleClearSelection = () => {
      setSelectedCompany(null);
      setSelectedContact(null);
      setSearchTerm('');
      setProjectName('');
      onClientSelect('', '', null);
      onProjectNameChange('');
    };

    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-orange-500 mb-6">Informações do Cliente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Client Field */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Cliente</label>
            <div className="relative">
              {selectedCompany ? (
                <div className="flex">
                  <input
                    type="text"
                    value={selectedCompany.company_name}
                    readOnly
                    className="w-full rounded-l-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                  />
                  <button
                    onClick={handleClearSelection}
                    className="bg-gray-700 text-gray-300 px-3 rounded-r-lg hover:bg-gray-600"
                    title="Alterar cliente"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => {
                      if (searchTerm.length >= 2) {
                        setShowCompanyDropdown(true);
                      }
                    }}
                    placeholder="Pesquisar empresa..."
                    className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                  />
                  {(!selectedCompany && showCompanyDropdown) && (
                    <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {isLoading ? (
                        <div className="p-4 text-gray-400">A pesquisar...</div>
                      ) : companies.length > 0 ? (
                        <ul>
                          {companies.map((company) => (
                            <li
                              key={company.id}
                              onClick={() => handleCompanySelect(company)}
                              className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-white">{company.company_name}</span>
                                <span className="text-gray-400 text-sm">{company.phc_number}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="p-4 text-gray-400">
                          {searchTerm.length < 2 ? 'Digite pelo menos 2 caracteres...' : 'Nenhuma empresa encontrada'}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* PHC ID Field */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">PHC ID</label>
            <input
              type="text"
              value={selectedCompany?.phc_number || ''}
              readOnly
              placeholder="Número PHC"
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            />
          </div>

          {/* Contact Field */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-1">Contacto</label>
            <select
              value={selectedContact?.id || ''}
              onChange={(e) => {
                const contact = contacts.find(c => c.id === e.target.value);
                if (contact) handleContactSelect(contact);
              }}
              disabled={!selectedCompany}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50"
            >
              <option value="">Selecionar contacto...</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.contact_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Name - Simplified to directly use the prop value */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-1">Nome do Projeto</label>
          <input
            type="text"
            value={propProjectName || projectName}
            onChange={(e) => {
              console.log("Project name input changed to:", e.target.value);
              setProjectName(e.target.value);
              onProjectNameChange(e.target.value);
            }}
            placeholder="Nome do projeto (obrigatório)"
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          />
        </div>
      </div>
    );
  }
); 