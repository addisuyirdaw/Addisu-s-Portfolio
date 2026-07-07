/**
 * Use Case: ManageProjects
 * Orchestrates CRUD operations for the Project domain entity.
 * Depends only on the ProjectRepository port — no framework coupling.
 */

import type { Project } from '../../domain/entities';
import type { ProjectRepository } from '../ports';

export class GetAllProjectsUseCase {
  private repo: ProjectRepository;
  constructor(repo: ProjectRepository) {
    this.repo = repo;
  }

  async execute(adminMode: boolean = false): Promise<Project[]> {
    return this.repo.getAll(adminMode);
  }
}

export class GetProjectBySlugUseCase {
  private repo: ProjectRepository;
  constructor(repo: ProjectRepository) {
    this.repo = repo;
  }

  async execute(slug: string): Promise<Project> {
    return this.repo.getBySlug(slug);
  }
}

export class CreateProjectUseCase {
  private repo: ProjectRepository;
  constructor(repo: ProjectRepository) {
    this.repo = repo;
  }

  async execute(data: Partial<Project>): Promise<Project> {
    if (!data.title || !data.slug) {
      throw new Error('Project title and slug are required.');
    }
    data.slug = data.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return this.repo.create(data as Omit<Project, 'id' | 'created_at' | 'views_count'>);
  }
}

export class UpdateProjectUseCase {
  private repo: ProjectRepository;
  constructor(repo: ProjectRepository) {
    this.repo = repo;
  }

  async execute(id: string, data: Partial<Project>): Promise<Project> {
    if (!id) throw new Error('Project ID is required for update.');
    return this.repo.update(id, data);
  }
}

export class DeleteProjectUseCase {
  private repo: ProjectRepository;
  constructor(repo: ProjectRepository) {
    this.repo = repo;
  }

  async execute(id: string): Promise<void> {
    if (!id) throw new Error('Project ID is required for deletion.');
    return this.repo.delete(id);
  }
}

export class IncrementProjectViewsUseCase {
  private repo: ProjectRepository;
  constructor(repo: ProjectRepository) {
    this.repo = repo;
  }

  async execute(id: string): Promise<void> {
    return this.repo.incrementViews(id);
  }
}
