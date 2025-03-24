import { supabase } from '@/lib/supabase';

/**
 * Types for the Clientes table
 */
export interface Cliente {
  id: string;
  phc_number: string;
  client_name: string;
  contact_name?: string;
  adress?: string;
  postal_code?: string;
  created_at: string;
}

/**
 * Hook for managing clients
 */
export const useClients = () => {
  /**
   * Fetch all clients
   */
  const fetchClients = async (): Promise<Cliente[]> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('client_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
    
    return data as Cliente[];
  };

  /**
   * Fetch a client by ID
   */
  const fetchClientById = async (id: string): Promise<Cliente | null> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching client by ID:', error);
      return null;
    }
    
    return data as Cliente;
  };

  /**
   * Fetch a client by PHC number
   */
  const fetchClientByPhcNumber = async (phcNumber: string): Promise<Cliente | null> => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('phc_number', phcNumber)
      .single();
    
    if (error) {
      console.error('Error fetching client by PHC number:', error);
      return null;
    }
    
    return data as Cliente;
  };

  /**
   * Create a new client
   */
  const createClient = async (client: Omit<Cliente, 'id' | 'created_at'>): Promise<Cliente | null> => {
    const { data, error } = await supabase
      .from('clientes')
      .insert([client])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      return null;
    }
    
    return data as Cliente;
  };

  /**
   * Update an existing client
   */
  const updateClient = async (id: string, client: Partial<Omit<Cliente, 'id' | 'created_at'>>): Promise<Cliente | null> => {
    const { data, error } = await supabase
      .from('clientes')
      .update(client)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      return null;
    }
    
    return data as Cliente;
  };

  /**
   * Delete a client
   */
  const deleteClient = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting client:', error);
      return false;
    }
    
    return true;
  };

  return {
    fetchClients,
    fetchClientById,
    fetchClientByPhcNumber,
    createClient,
    updateClient,
    deleteClient,
  };
};
