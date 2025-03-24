"use client";
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Cliente {
  id: string;
  client_name: string;
  phc_number: string;
  contact_name: string | null;
}

interface SelectClientProps {
  value: string;
  onChange: (clientName: string) => void;
  onClientSelect: (client: Cliente) => void;
  label?: string;
  placeholder?: string;
}

export const SelectClient: React.FC<SelectClientProps> = ({
  value,
  onChange,
  onClientSelect,
  label = "Cliente",
  placeholder = "Nome do cliente"
}) => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position for dropdown
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [isOpen]);

  // Load all clients once on mount
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('id, client_name, phc_number, contact_name')
          .order('client_name');
        
        if (error) {
          console.error('Error fetching clients:', error);
          return;
        }
        
        console.log('Loaded clients:', data);
        setClients(data || []);
      } catch (error) {
        console.error('Error loading clients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);

  // Filter clients when input value changes
  useEffect(() => {
    if (!value.trim()) {
      setFilteredClients([]);
      return;
    }
    
    const lowercaseValue = value.toLowerCase();
    const filtered = clients.filter(client => 
      client.client_name.toLowerCase().includes(lowercaseValue) ||
      client.phc_number.includes(lowercaseValue)
    );
    
    console.log('Filtered clients:', filtered);
    setFilteredClients(filtered);
  }, [value, clients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleClientClick = (client: Cliente) => {
    console.log('Selected client:', client);
    onChange(client.client_name);
    onClientSelect(client);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    console.log('Toggling dropdown, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  // Group clients by PHC number for better display in dropdown
  const groupClientsByPhc = (clients: Cliente[]) => {
    const grouped: Record<string, Cliente[]> = {};
    
    clients.forEach(client => {
      if (!grouped[client.phc_number]) {
        grouped[client.phc_number] = [];
      }
      grouped[client.phc_number].push(client);
    });
    
    return grouped;
  };

  const groupedClients = groupClientsByPhc(filteredClients);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">{label}</label>
      <div className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              console.log('Input focused, opening dropdown');
              setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          />
          <button
            type="button"
            onClick={toggleDropdown}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div 
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 9999
            }}
            className="bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {isLoading ? (
              <div className="p-2 text-gray-400 text-sm">Carregando...</div>
            ) : filteredClients.length > 0 ? (
              <ul className="py-1">
                {Object.entries(groupedClients).map(([phcNumber, clients]) => (
                  <div key={phcNumber} className="border-b border-gray-700 last:border-b-0">
                    {/* PHC Group Header */}
                    <div className="bg-gray-900 px-4 py-1 text-xs font-medium text-gray-400">
                      PHC: {phcNumber} - {clients[0].client_name}
                    </div>
                    
                    {/* Individual contacts within this PHC number */}
                    {clients.map((client) => (
                      <li
                        key={client.id}
                        className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white"
                        onClick={() => handleClientClick(client)}
                      >
                        <div className="font-medium text-sm flex justify-between">
                          <span>{client.client_name}</span>
                          {clients.length > 1 && (
                            <span className="text-orange-500">{client.contact_name || 'Sem contacto'}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </div>
                ))}
              </ul>
            ) : value ? (
              <div className="p-2 text-gray-400 text-sm">Nenhum cliente encontrado</div>
            ) : (
              <div className="p-2 text-gray-400 text-sm">Digite para pesquisar</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 