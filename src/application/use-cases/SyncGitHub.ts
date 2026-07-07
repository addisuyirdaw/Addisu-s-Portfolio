/**
 * Use Case: SyncGitHub
 * Fetches GitHub repository data via the GitHubGateway port.
 * Maps raw API data to portfolio project enrichment.
 */

import type { GitHubGateway } from '../ports';

export interface GitHubRepoSummary {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  url: string;
  updatedAt: string;
}

export class SyncGitHubUseCase {
  private gateway: GitHubGateway;
  constructor(gateway: GitHubGateway) {
    this.gateway = gateway;
  }

  async execute(username: string): Promise<GitHubRepoSummary[]> {
    if (!username || typeof username !== 'string') {
      throw new Error('Valid GitHub username is required.');
    }
    const repos = await this.gateway.fetchRepos(username);
    return repos.map((r: any) => ({
      name: r.name,
      description: r.description || null,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      language: r.language || null,
      url: r.html_url || '',
      updatedAt: new Date().toISOString()
    }));
  }
}

export class GetGitHubProfileUseCase {
  private gateway: GitHubGateway;
  constructor(gateway: GitHubGateway) {
    this.gateway = gateway;
  }

  async execute(username: string): Promise<{
    stars: number;
    reposCount: number;
    languages: { [key: string]: number };
    commitsThisYear: number;
  }> {
    return this.gateway.fetchStats(username);
  }
}
