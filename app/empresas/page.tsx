"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '../components/ui/Card';

interface Company {
  id: string;
  company_name: string;
  phc_number: string;
  created_at: string;
}

interface Contact {
  id: string;
  company_id: string;
  contact_name: string;
  email?: string;
  phone?: string;
  created_at: string;
}

export default function EmpresasPage() {
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompany, setNewCompany] = useState<Partial<Company>>({
    company_name: '',
    phc_number: ''
  });
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [companyFormData, setCompanyFormData] = useState<Partial<Company>>({});
  
  // Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<Partial<Contact>>({
    company_id: '',
    contact_name: '',
    email: '',
    phone: ''
  });
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactFormData, setContactFormData] = useState<Partial<Contact>>({});
  
  // UI state
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Add search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  
  useEffect(() => {
    fetchCompanies();
  }, []);
  
  useEffect(() => {
    if (selectedCompanyId) {
      fetchContactsForCompany(selectedCompanyId);
      setNewContact(prev => ({ ...prev, company_id: selectedCompanyId }));
    } else {
      setContacts([]);
    }
  }, [selectedCompanyId]);
  
  // Add useEffect for filtering companies based on search term
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const filtered = companies.filter(
        company => 
          company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.phc_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies([]);
    }
  }, [searchTerm, companies]);
  
  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('company_name');
        
      if (error) throw error;
      setCompanies(data || []);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      setErrorMessage('Erro ao carregar empresas.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchContactsForCompany = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('contact_name');
        
      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      setErrorMessage('Erro ao carregar contactos.');
    }
  };
  
  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingCompanyId) {
      setCompanyFormData({
        ...companyFormData,
        [name]: value
      });
    } else {
      setNewCompany({
        ...newCompany,
        [name]: value
      });
    }
  };
  
  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingContactId) {
      setContactFormData({
        ...contactFormData,
        [name]: value
      });
    } else {
      setNewContact({
        ...newContact,
        [name]: value
      });
    }
  };
  
  const handleAddCompany = async () => {
    if (!newCompany.company_name || !newCompany.phc_number) {
      setErrorMessage('Por favor, preencha o nome da empresa e o número PHC.');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          company_name: newCompany.company_name,
          phc_number: newCompany.phc_number
        }])
        .select();
        
      if (error) throw error;
      
      setSuccessMessage('Empresa adicionada com sucesso!');
      setNewCompany({
        company_name: '',
        phc_number: ''
      });
      fetchCompanies();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error adding company:', error);
      setErrorMessage('Erro ao adicionar empresa: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  const handleEditCompany = (company: Company) => {
    setCompanyFormData(company);
    setEditingCompanyId(company.id);
  };
  
  const handleCancelEditCompany = () => {
    setEditingCompanyId(null);
    setCompanyFormData({});
  };
  
  const handleSaveCompany = async () => {
    if (!editingCompanyId) return;
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          company_name: companyFormData.company_name,
          phc_number: companyFormData.phc_number
        })
        .eq('id', editingCompanyId);
      
      if (error) throw error;
      
      setSuccessMessage('Empresa atualizada com sucesso!');
      setEditingCompanyId(null);
      setCompanyFormData({});
      fetchCompanies();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error updating company:', error);
      setErrorMessage('Erro ao atualizar empresa: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar esta empresa? Esta ação não pode ser desfeita e irá remover todos os contactos associados.')) {
      return;
    }
    
    try {
      // First delete all contacts associated with this company
      const { error: contactsError } = await supabase
        .from('contacts')
        .delete()
        .eq('company_id', id);
        
      if (contactsError) throw contactsError;
      
      // Then delete the company
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setSuccessMessage('Empresa eliminada com sucesso!');
      fetchCompanies();
      
      if (selectedCompanyId === id) {
        setSelectedCompanyId(null);
        setContacts([]);
      }
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting company:', error);
      setErrorMessage('Erro ao eliminar empresa: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  const handleSelectCompany = (id: string) => {
    setSelectedCompanyId(id);
  };
  
  const handleAddContact = async () => {
    if (!newContact.contact_name || !newContact.company_id) {
      setErrorMessage('Por favor, preencha o nome do contacto e selecione uma empresa.');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([{
          company_id: newContact.company_id,
          contact_name: newContact.contact_name,
          email: newContact.email || null,
          phone: newContact.phone || null
        }])
        .select();
        
      if (error) throw error;
      
      setSuccessMessage('Contacto adicionado com sucesso!');
      setNewContact({
        company_id: selectedCompanyId || '',
        contact_name: '',
        email: '',
        phone: ''
      });
      fetchContactsForCompany(selectedCompanyId!);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error adding contact:', error);
      setErrorMessage('Erro ao adicionar contacto: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  const handleEditContact = (contact: Contact) => {
    setContactFormData(contact);
    setEditingContactId(contact.id);
  };
  
  const handleCancelEditContact = () => {
    setEditingContactId(null);
    setContactFormData({});
  };
  
  const handleSaveContact = async () => {
    if (!editingContactId) return;
    
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          contact_name: contactFormData.contact_name,
          email: contactFormData.email || null,
          phone: contactFormData.phone || null
        })
        .eq('id', editingContactId);
      
      if (error) throw error;
      
      setSuccessMessage('Contacto atualizado com sucesso!');
      setEditingContactId(null);
      setContactFormData({});
      fetchContactsForCompany(selectedCompanyId!);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error updating contact:', error);
      setErrorMessage('Erro ao atualizar contacto: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  const handleDeleteContact = async (id: string) => {
    if (!confirm('Tem certeza que deseja eliminar este contacto? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setSuccessMessage('Contacto eliminado com sucesso!');
      fetchContactsForCompany(selectedCompanyId!);
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      setErrorMessage('Erro ao eliminar contacto: ' + error.message);
      
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-orange-500">Gestão de Empresas e Contactos</h1>
      
      {(successMessage || errorMessage) && (
        <div className={`mb-4 p-3 rounded ${successMessage ? 'bg-green-800 text-white' : 'bg-red-700 text-white'}`}>
          {successMessage || errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Companies List */}
        <div>
          <Card title="Empresas">
            <div className="p-4">
              {/* Make search more prominent */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-white mb-2">Pesquisar Empresas</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome da empresa ou número PHC (mínimo 2 caracteres)"
                  className="w-full rounded-lg bg-gray-800 px-4 py-3 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                />
                <p className="mt-2 text-sm text-gray-400">
                  {searchTerm.length < 2 
                    ? "Digite pelo menos 2 caracteres para pesquisar" 
                    : filteredCompanies.length === 0 
                      ? "Nenhuma empresa corresponde à sua pesquisa" 
                      : `${filteredCompanies.length} ${filteredCompanies.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}`
                  }
                </p>
              </div>
              
              {/* Show search results */}
              {searchTerm.length >= 2 && filteredCompanies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Resultados da Pesquisa</h3>
                  <div className="space-y-3">
                    {filteredCompanies.map((company) => (
                      <div 
                        key={company.id} 
                        className={`p-3 rounded-lg border cursor-pointer ${
                          selectedCompanyId === company.id 
                            ? 'border-orange-500 bg-gray-800' 
                            : 'border-gray-700 bg-gray-900 hover:bg-gray-800'
                        } transition-colors duration-200`}
                        onClick={() => handleSelectCompany(company.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-white font-medium">{company.company_name}</h4>
                            <p className="text-sm text-gray-400">PHC: {company.phc_number}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCompany(company);
                              }}
                              className="p-1 text-orange-400 hover:text-orange-300 focus:outline-none"
                              title="Editar Empresa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCompany(company.id);
                              }}
                              className="p-1 text-red-400 hover:text-red-300 focus:outline-none"
                              title="Eliminar Empresa"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Move company editing to a separate section that only appears when editing */}
              {editingCompanyId && (
                <div className="mb-6 p-4 border border-orange-500 rounded-lg bg-gray-800">
                  <h3 className="text-lg font-semibold mb-4">Editar Empresa</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Empresa</label>
                      <input
                        type="text"
                        name="company_name"
                        value={companyFormData.company_name || ''}
                        onChange={handleCompanyInputChange}
                        className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Número PHC</label>
                      <input
                        type="text"
                        name="phc_number"
                        value={companyFormData.phc_number || ''}
                        onChange={handleCompanyInputChange}
                        className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 mt-3">
                      <button
                        onClick={handleSaveCompany}
                        className="px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={handleCancelEditCompany}
                        className="px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Add company form at the bottom */}
              <div className="border-t border-gray-700 pt-4">
                <h3 className="text-lg font-semibold mb-4">Adicionar Nova Empresa</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Empresa</label>
                    <input
                      type="text"
                      name="company_name"
                      value={newCompany.company_name}
                      onChange={handleCompanyInputChange}
                      placeholder="Nome da empresa"
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Número PHC</label>
                    <input
                      type="text"
                      name="phc_number"
                      value={newCompany.phc_number}
                      onChange={handleCompanyInputChange}
                      placeholder="Número PHC"
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    />
                  </div>
                  <button
                    onClick={handleAddCompany}
                    className="w-full px-4 py-2 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                  >
                    Adicionar Empresa
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Contacts Management */}
        <div>
          <Card title="Contactos">
            <div className="p-4">
              {selectedCompanyId ? (
                <>
                  {/* Show selected company details */}
                  <div className="mb-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-orange-500">
                      {companies.find(c => c.id === selectedCompanyId)?.company_name || 'Empresa Selecionada'}
                    </h3>
                    <p className="text-sm text-gray-300">
                      PHC: {companies.find(c => c.id === selectedCompanyId)?.phc_number || ''}
                    </p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nome do Contacto</label>
                      <input
                        type="text"
                        name="contact_name"
                        value={newContact.contact_name}
                        onChange={handleContactInputChange}
                        placeholder="Nome do contacto"
                        className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newContact.email || ''}
                        onChange={handleContactInputChange}
                        placeholder="Email (opcional)"
                        className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                      <input
                        type="text"
                        name="phone"
                        value={newContact.phone || ''}
                        onChange={handleContactInputChange}
                        placeholder="Telefone (opcional)"
                        className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                      />
                    </div>
                    <button
                      onClick={handleAddContact}
                      className="w-full px-4 py-2 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                    >
                      Adicionar Contacto
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4 border-t border-gray-700 pt-4">Lista de Contactos</h3>
                  {contacts.length === 0 ? (
                    <div className="text-center text-gray-400 py-4">Nenhum contacto encontrado para esta empresa.</div>
                  ) : (
                    <div className="space-y-4">
                      {contacts.map((contact) => (
                        <div 
                          key={contact.id} 
                          className="p-4 rounded-lg border border-gray-700 bg-gray-900"
                        >
                          {editingContactId === contact.id ? (
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nome</label>
                                <input
                                  type="text"
                                  name="contact_name"
                                  value={contactFormData.contact_name || ''}
                                  onChange={handleContactInputChange}
                                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                                <input
                                  type="email"
                                  name="email"
                                  value={contactFormData.email || ''}
                                  onChange={handleContactInputChange}
                                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Telefone</label>
                                <input
                                  type="text"
                                  name="phone"
                                  value={contactFormData.phone || ''}
                                  onChange={handleContactInputChange}
                                  className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white border border-gray-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                                />
                              </div>
                              <div className="flex justify-end space-x-2 mt-3">
                                <button
                                  onClick={handleSaveContact}
                                  className="px-3 py-1 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                                >
                                  Guardar
                                </button>
                                <button
                                  onClick={handleCancelEditContact}
                                  className="px-3 py-1 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="text-white font-medium">{contact.contact_name}</h4>
                                {contact.email && (
                                  <p className="text-sm text-gray-400">Email: {contact.email}</p>
                                )}
                                {contact.phone && (
                                  <p className="text-sm text-gray-400">Telefone: {contact.phone}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditContact(contact)}
                                  className="p-1 text-orange-400 hover:text-orange-300 focus:outline-none"
                                  title="Editar Contacto"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteContact(contact.id)}
                                  className="p-1 text-red-400 hover:text-red-300 focus:outline-none"
                                  title="Eliminar Contacto"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-gray-400 py-12">
                  <p className="text-xl mb-4">Nenhuma empresa selecionada</p>
                  <p className="text-md">Pesquise e selecione uma empresa para gerir os seus contactos.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 