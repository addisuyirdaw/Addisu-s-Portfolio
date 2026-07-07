/**
 * Presentation Hook: useProjects
 * Presenter connecting ProjectRepository to React component state.
 * Encapsulates loading, error, and CRUD operation states.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Project } from '../../domain/entities';
import { projectRepository } from '../../infrastructure/gateways';

interface UseProjectsOptions {
  adminMode?: boolean;
}

interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  reload: () => void;
  createProject: (data: Partial<Project>) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export function useProjects({ adminMode = false }: UseProjectsOptions = {}): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectRepository.getAll(adminMode);
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, [adminMode]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (data: Partial<Project>): Promise<void> => {
    await projectRepository.create(data as Omit<Project, 'id' | 'created_at' | 'views_count'>);
    await fetchProjects();
  };

  const updateProject = async (id: string, data: Partial<Project>): Promise<void> => {
    await projectRepository.update(id, data);
    await fetchProjects();
  };

  const deleteProject = async (id: string): Promise<void> => {
    await projectRepository.delete(id);
    await fetchProjects();
  };

  return { projects, loading, error, reload: fetchProjects, createProject, updateProject, deleteProject };
}
