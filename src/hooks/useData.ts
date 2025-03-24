import { useState } from 'react';
import { supabase, TechnicalVisit, Implementation, Project } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export const useProjects = () => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data as Project[]);
    }
    
    setLoading(false);
  };

  const createProject = async (name: string, clientId: string) => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          client_id: clientId,
          created_by: user.id,
          status: 'active',
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating project:', error);
      return null;
    }
    
    await fetchProjects();
    return data as Project;
  };

  return {
    loading,
    projects,
    fetchProjects,
    createProject,
  };
};

export const useTechnicalVisits = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const [visits, setVisits] = useState<TechnicalVisit[]>([]);
  const { user } = useAuth();

  const fetchVisits = async () => {
    if (!user || !projectId) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('technical_visits')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching technical visits:', error);
    } else {
      setVisits(data as TechnicalVisit[]);
    }
    
    setLoading(false);
  };

  const saveVisit = async (visit: Omit<TechnicalVisit, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !projectId) return null;
    
    const { data, error } = await supabase
      .from('technical_visits')
      .insert([
        {
          ...visit,
          project_id: projectId,
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving technical visit:', error);
      return null;
    }
    
    await fetchVisits();
    return data as TechnicalVisit;
  };

  return {
    loading,
    visits,
    fetchVisits,
    saveVisit,
  };
};

export const useImplementations = (projectId?: string) => {
  const [loading, setLoading] = useState(false);
  const [implementations, setImplementations] = useState<Implementation[]>([]);
  const { user } = useAuth();

  const fetchImplementations = async () => {
    if (!user || !projectId) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('implementations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching implementations:', error);
    } else {
      setImplementations(data as Implementation[]);
    }
    
    setLoading(false);
  };

  const saveImplementation = async (implementation: Omit<Implementation, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user || !projectId) return null;
    
    const { data, error } = await supabase
      .from('implementations')
      .insert([
        {
          ...implementation,
          project_id: projectId,
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving implementation:', error);
      return null;
    }
    
    await fetchImplementations();
    return data as Implementation;
  };

  return {
    loading,
    implementations,
    fetchImplementations,
    saveImplementation,
  };
};
