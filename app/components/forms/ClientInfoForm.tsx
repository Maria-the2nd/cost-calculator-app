"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ClientInfoInput } from '../ui/ClientInfoInput';
import { SelectClient } from '../ui/SelectClient';
import { supabase } from '@/lib/supabase';

interface Contact {
  id: string;
  client_name: string;
  phc_number: string;
  contact_name: string | null;
}

interface ClientInfoFormProps {
  onClientSelect?: (clientId: string | null, clientName?: string, phcNumber?: string, contactName?: string, projectName?: string) => void;
}

const SelectContact: React.FC<{
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contact: Contact) => void;
  label?: string;
  disabled?: boolean;
}> = ({ contacts, selectedContactId, onSelectContact, label = "Contacto", disabled = false }) => {
  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const nameA = a.contact_name || '';
      const nameB = b.contact_name || '';
      return nameA.localeCompare(nameB);
    });
  }, [contacts]);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <select
        className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 disabled:opacity-50"
        value={selectedContactId || ''}
        onChange={(e) => {
          const contact = sortedContacts.find(c => c.id === e.target.value);
          if (contact) onSelectContact(contact);
        }}
        disabled={disabled || contacts.length === 0}
      >
        {contacts.length === 0 ? (
          <option value="">Nenhum contacto disponível</option>
        ) : (
          <>
            <option value="">Selecione um contacto</option>
            {sortedContacts.map(contact => (
              <option key={contact.id} value={contact.id}>
                {contact.contact_name || 'Sem nome'}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

export const ClientInfoForm: React.FC<ClientInfoFormProps> = ({
  onClientSelect,
}) => {
  // Form state
  const [clientName, setClientName] = useState('');
  const [phcNumber, setPhcNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [clientId, setClientId] = useState<string | null>(null);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewContact, setIsNewContact] = useState(false);

  // Handle client selection from dropdown
  const handleClientSelection = async (client: {
    id: string;
    client_name: string;
    phc_number: string;
    contact_name: string | null;
  }) => {
    setClientName(client.client_name);
    setPhcNumber(client.phc_number);
    setContactName(client.contact_name || '');
    setClientId(client.id);
    
    if (onClientSelect) {
      onClientSelect(client.id, client.client_name, client.phc_number, client.contact_name || '', projectName);
    }

    // Fetch all contacts for this client (based on PHC number and client name)
    await fetchContactsForClient(client.phc_number, client.client_name);
  };

  // Fetch all contacts for a client
  const fetchContactsForClient = async (phcNumber: string, clientName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, client_name, phc_number, contact_name')
        .eq('phc_number', phcNumber)
        .eq('client_name', clientName);

      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }

      console.log('Available contacts:', data);
      setAvailableContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle contact selection from dropdown
  const handleContactSelect = (contact: Contact) => {
    setContactName(contact.contact_name || '');
    setClientId(contact.id);
    
    if (onClientSelect) {
      onClientSelect(contact.id, contact.client_name, contact.phc_number, contact.contact_name || '', projectName);
    }
  };

  // Function to add a new contact
  const addNewContact = async () => {
    if (!clientName || !phcNumber || !contactName) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          client_name: clientName,
          phc_number: phcNumber,
          contact_name: contactName
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding new contact:', error);
        return;
      }

      setClientId(data.id);
      if (onClientSelect) onClientSelect(data.id, data.client_name, data.phc_number, data.contact_name || '', projectName);
      
      // Refresh contacts list
      await fetchContactsForClient(phcNumber, clientName);
      setIsNewContact(false);
    } catch (error) {
      console.error('Error adding new contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save client data to Supabase - for creating new clients or updating contact name
  const saveClientInfo = async () => {
    if (!clientName || !phcNumber) return;

    try {
      // First check if client with this PHC number and client name exists
      const { data: existingClients, error: fetchError } = await supabase
        .from('clientes')
        .select('*')
        .eq('phc_number', phcNumber)
        .eq('client_name', clientName);

      if (fetchError) {
        console.error('Error fetching clients:', fetchError);
        return;
      }

      if (existingClients && existingClients.length > 0) {
        // If we have a specific client ID selected
        if (clientId) {
          // Update existing contact
          const { data, error } = await supabase
            .from('clientes')
            .update({ 
              contact_name: contactName || null
            })
            .eq('id', clientId)
            .select()
            .single();

          if (error) {
            console.error('Error updating contact:', error);
            return;
          }

          // Refresh contacts list
          await fetchContactsForClient(phcNumber, clientName);
        } else if (isNewContact) {
          // Create a new contact for existing client/PHC
          await addNewContact();
        } else {
          // Select the first contact by default
          setClientId(existingClients[0].id);
          setContactName(existingClients[0].contact_name || '');
          if (onClientSelect) onClientSelect(existingClients[0].id, existingClients[0].client_name, existingClients[0].phc_number, existingClients[0].contact_name || '', projectName);
        }
      } else {
        // Create new client with contact
        const { data, error } = await supabase
          .from('clientes')
          .insert([{ 
            phc_number: phcNumber,
            client_name: clientName,
            contact_name: contactName || null
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating client:', error);
          return;
        }

        setClientId(data.id);
        if (onClientSelect) onClientSelect(data.id, data.client_name, data.phc_number, data.contact_name || '', projectName);
        
        // Set this as the only available contact
        setAvailableContacts([data]);
      }
    } catch (error) {
      console.error('Error saving client info:', error);
    }
  };

  // Handle project name change
  const handleProjectNameChange = (value: string) => {
    setProjectName(value);
    if (onClientSelect && clientId) {
      onClientSelect(clientId, clientName, phcNumber, contactName, value);
    }
  };

  return (
    <div className="mb-6 bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-orange-500 mb-4">Informações do Cliente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <SelectClient
            value={clientName}
            onChange={setClientName}
            onClientSelect={handleClientSelection}
            label="Cliente"
            placeholder="Nome do cliente"
          />
          
          <ClientInfoInput
            label="PHC ID"
            value={phcNumber}
            onChange={setPhcNumber}
            placeholder="Número PHC"
            maxLength={6}
            required={true}
            disabled={!!clientId}
          />
          
          <div className="relative">
            {availableContacts.length > 1 ? (
              <div className="flex flex-col">
                <SelectContact
                  contacts={availableContacts}
                  selectedContactId={clientId}
                  onSelectContact={handleContactSelect}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsNewContact(true);
                    setContactName('');
                    setClientId(null);
                  }}
                  className="mt-2 text-xs text-orange-500 hover:text-orange-400"
                >
                  + Adicionar novo contacto
                </button>
              </div>
            ) : (
              <ClientInfoInput
                label="Contacto"
                value={contactName}
                onChange={setContactName}
                placeholder="Nome do contacto"
              />
            )}
            
            {isNewContact && (
              <div className="mt-2 flex items-center">
                <button
                  onClick={addNewContact}
                  className="bg-orange-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-orange-600 disabled:opacity-50"
                  disabled={isLoading || !contactName}
                >
                  {isLoading ? 'A guardar...' : 'Guardar contacto'}
                </button>
                <button
                  onClick={() => {
                    setIsNewContact(false);
                    if (availableContacts.length > 0) {
                      const firstContact = availableContacts[0];
                      setClientId(firstContact.id);
                      setContactName(firstContact.contact_name || '');
                    }
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-300 text-xs"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Project name field */}
        <div className="mt-4">
          <ClientInfoInput
            label="Nome do Projeto"
            value={projectName}
            onChange={handleProjectNameChange}
            placeholder="Nome do projeto (obrigatório)"
            required={true}
          />
        </div>
      </div>
    </div>
  );
}; 