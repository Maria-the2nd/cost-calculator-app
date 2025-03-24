"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card } from '../components/ui/Card';

interface RateValue {
  id: string;
  description: string;
  value: number;
  currency: string;
  is_current: boolean;
}

export default function TabelaPage() {
  const [rateValues, setRateValues] = useState<RateValue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<RateValue>>({});
  const [newRateValue, setNewRateValue] = useState<Partial<RateValue>>({
    description: '',
    value: 0,
    currency: 'EUR',
    is_current: true
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchRateValues();
  }, []);

  const fetchRateValues = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rate_values')
        .select('*')
        .order('description');

      if (error) throw error;
      setRateValues(data || []);
    } catch (error: any) {
      console.error('Error fetching rate values:', error);
      setErrorMessage('Erro ao carregar valores da tabela.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const valueToEdit = rateValues.find(rv => rv.id === id);
    if (valueToEdit) {
      setFormData(valueToEdit);
      setEditingId(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    
    try {
      const { error } = await supabase
        .from('rate_values')
        .update({
          description: formData.description,
          value: formData.value,
          currency: formData.currency,
          is_current: formData.is_current
        })
        .eq('id', editingId);
      
      if (error) throw error;
      
      setSuccessMessage('Valor atualizado com sucesso!');
      setEditingId(null);
      setFormData({});
      fetchRateValues();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error updating rate value:', error);
      setErrorMessage('Erro ao atualizar valor: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (editingId) {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
      });
    } else {
      setNewRateValue({
        ...newRateValue,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
      });
    }
  };

  const handleAddNew = async () => {
    try {
      if (!newRateValue.description) {
        setErrorMessage('Por favor, preencha a descrição.');
        return;
      }

      const { error } = await supabase
        .from('rate_values')
        .insert([{
          description: newRateValue.description,
          value: newRateValue.value || 0,
          currency: newRateValue.currency || 'EUR',
          is_current: newRateValue.is_current !== undefined ? newRateValue.is_current : true
        }]);
      
      if (error) throw error;
      
      setSuccessMessage('Novo valor adicionado com sucesso!');
      setNewRateValue({
        description: '',
        value: 0,
        currency: 'EUR',
        is_current: true
      });
      fetchRateValues();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error adding rate value:', error);
      setErrorMessage('Erro ao adicionar valor: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Direct Navigation Menu */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-bold text-orange-500 text-xl">Calculadora de Custos</div>
          <div className="flex space-x-4">
            <Link href="/" className="px-3 py-1 text-gray-300 hover:bg-gray-700 rounded">
              Calculadora
            </Link>
            <Link href="/tabela" className="px-3 py-1 bg-orange-600 text-white rounded">
              Tabela
            </Link>
            <Link href="/empresas" className="px-3 py-1 text-gray-300 hover:bg-gray-700 rounded">
              Empresas
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-orange-500">Tabela de Valores</h1>
        
        {(successMessage || errorMessage) && (
          <div className={`mb-4 p-3 rounded ${successMessage ? 'bg-green-800 text-white' : 'bg-red-700 text-white'}`}>
            {successMessage || errorMessage}
          </div>
        )}
        
        <Card title="Adicionar Novo Valor">
          <div className="p-4">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="w-full md:w-64">
                <label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
                <input
                  type="text"
                  name="description"
                  value={newRateValue.description || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                />
              </div>
              <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-300 mb-1">Valor</label>
                <input
                  type="number"
                  name="value"
                  value={newRateValue.value || 0}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                />
              </div>
              <div className="w-full md:w-auto flex items-end">
                <button
                  onClick={handleAddNew}
                  className="px-4 py-2 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </Card>
        
        <Card title="Lista de Valores" className="mt-6">
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Valor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Moeda
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ativo
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                      A carregar valores...
                    </td>
                  </tr>
                ) : rateValues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-400">
                      Nenhum valor encontrado.
                    </td>
                  </tr>
                ) : (
                  rateValues.map((rateValue) => (
                    <tr key={rateValue.id}>
                      <td className="px-6 py-4">
                        {editingId === rateValue.id ? (
                          <input
                            type="text"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleInputChange}
                            className="w-full rounded-lg bg-gray-800 px-3 py-1 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                          />
                        ) : (
                          rateValue.description
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === rateValue.id ? (
                          <input
                            type="number"
                            name="value"
                            value={formData.value || 0}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="w-full rounded-lg bg-gray-800 px-3 py-1 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                          />
                        ) : (
                          rateValue.value
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === rateValue.id ? (
                          <select
                            name="currency"
                            value={formData.currency || 'EUR'}
                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                            className="rounded-lg bg-gray-800 px-3 py-1 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                          >
                            <option value="EUR">EUR</option>
                            <option value="€">€</option>
                          </select>
                        ) : (
                          rateValue.currency
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {editingId === rateValue.id ? (
                          <input
                            type="checkbox"
                            name="is_current"
                            checked={formData.is_current}
                            onChange={handleInputChange}
                            className="rounded bg-gray-800 text-orange-600 focus:ring-orange-500"
                          />
                        ) : (
                          <span className={rateValue.is_current ? 'text-green-500' : 'text-red-500'}>
                            {rateValue.is_current ? 'Sim' : 'Não'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingId === rateValue.id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(rateValue.id)}
                            className="px-3 py-1 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                          >
                            Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
} 