"use client";
import React, { useState, useEffect } from 'react';
import { useClients, Cliente } from '@/hooks/useClients';

interface ClientSelectorProps {
  selectedClientId: string | null;
  onClientSelect: (clientId: string | null) => void;
  onAddNewClient: () => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedClientId,
  onClientSelect,
  onAddNewClient
}) => {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchClients } = useClients();

  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      const clientsData = await fetchClients();
      setClients(clientsData);
      setIsLoading(false);
    };

    loadClients();
  }, [fetchClients]);

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-200">Cliente</label>
      <div className="flex items-center space-x-2">
        <select
          value={selectedClientId || ''}
          onChange={(e) => onClientSelect(e.target.value || null)}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
          disabled={isLoading}
        >
          <option value="">Selecionar cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.client_name} (PHC: {client.phc_number})
            </option>
          ))}
        </select>
        <button
          onClick={onAddNewClient}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
};

interface ClientFormProps {
  client: Partial<Omit<Cliente, 'id' | 'created_at'>> | null;
  onSave: (client: Omit<Cliente, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  client,
  onSave,
  onCancel,
  isEditing
}) => {
  const [formData, setFormData] = useState<Omit<Cliente, 'id' | 'created_at'>>({
    phc_number: client?.phc_number || '',
    client_name: client?.client_name || '',
    contact_name: client?.contact_name || '',
    adress: client?.adress || '',
    postal_code: client?.postal_code || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.phc_number) {
      newErrors.phc_number = 'Número PHC é obrigatório';
    } else if (formData.phc_number.length !== 6 || !/^\d+$/.test(formData.phc_number)) {
      newErrors.phc_number = 'Número PHC deve ter 6 dígitos';
    }
    
    if (!formData.client_name) {
      newErrors.client_name = 'Nome do cliente é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-4">
      <h3 className="text-lg font-medium text-white mb-4">
        {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
      </h3>
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="phc_number" className="text-sm font-medium text-gray-200">
          Número PHC (6 dígitos)
        </label>
        <input
          id="phc_number"
          name="phc_number"
          type="text"
          maxLength={6}
          value={formData.phc_number}
          onChange={handleChange}
          className={`rounded-lg bg-gray-800 px-3 py-2 text-white border ${
            errors.phc_number ? 'border-red-500' : 'border-gray-700'
          } focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50`}
        />
        {errors.phc_number && (
          <p className="text-sm text-red-500">{errors.phc_number}</p>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="client_name" className="text-sm font-medium text-gray-200">
          Nome do Cliente
        </label>
        <input
          id="client_name"
          name="client_name"
          type="text"
          value={formData.client_name}
          onChange={handleChange}
          className={`rounded-lg bg-gray-800 px-3 py-2 text-white border ${
            errors.client_name ? 'border-red-500' : 'border-gray-700'
          } focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50`}
        />
        {errors.client_name && (
          <p className="text-sm text-red-500">{errors.client_name}</p>
        )}
      </div>
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="contact_name" className="text-sm font-medium text-gray-200">
          Nome do Contacto
        </label>
        <input
          id="contact_name"
          name="contact_name"
          type="text"
          value={formData.contact_name}
          onChange={handleChange}
          className="rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        />
      </div>
      
      <div className="flex flex-col space-y-2">
        <label htmlFor="postal_code" className="text-sm font-medium text-gray-200">
          Código Postal
        </label>
        <input
          id="postal_code"
          name="postal_code"
          type="text"
          value={formData.postal_code}
          onChange={handleChange}
          className="rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        />
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Guardar
        </button>
      </div>
    </form>
  );
};
