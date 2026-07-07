import type { 
  Project, 
  TimelineEvent, 
  Skill, 
  Achievement, 
  Testimonial, 
  Blog, 
  Message, 
  ResumeTemplate,
  MediaFile,
  Profile,
  AnalyticsSummary
} from '../../domain/entities';

export interface AuthGateway {
  login(email: string, password?: string): Promise<{ user: any; session: any }>;
  loginWithOAuth(provider: 'github' | 'google'): Promise<void>;
  logout(): Promise<void>;
  getSession(): Promise<any>;
  onAuthStateChange(callback: (event: string, session: any) => void): { unsubscribe: () => void };
}

export interface ProjectRepository {
  getAll(includeUnpublished?: boolean): Promise<Project[]>;
  getById(id: string): Promise<Project>;
  getBySlug(slug: string): Promise<Project>;
  create(project: Omit<Project, 'id' | 'created_at' | 'views_count'>): Promise<Project>;
  update(id: string, project: Partial<Project>): Promise<Project>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
}

export interface TimelineRepository {
  getAll(): Promise<TimelineEvent[]>;
  create(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent>;
  update(id: string, event: Partial<TimelineEvent>): Promise<TimelineEvent>;
  delete(id: string): Promise<void>;
}

export interface SkillRepository {
  getAll(): Promise<Skill[]>;
  create(skill: Omit<Skill, 'id'>): Promise<Skill>;
  update(id: string, skill: Partial<Skill>): Promise<Skill>;
  delete(id: string): Promise<void>;
}

export interface AchievementRepository {
  getAll(): Promise<Achievement[]>;
  getById(id: string): Promise<Achievement>;
  getBySlug(slug: string): Promise<Achievement>;
  create(achievement: Omit<Achievement, 'id'>): Promise<Achievement>;
  update(id: string, achievement: Partial<Achievement>): Promise<Achievement>;
  delete(id: string): Promise<void>;
}

export interface BlogRepository {
  getAll(includeUnpublished?: boolean): Promise<Blog[]>;
  getBySlug(slug: string): Promise<Blog>;
  create(blog: Omit<Blog, 'id' | 'created_at' | 'views_count'>): Promise<Blog>;
  update(id: string, blog: Partial<Blog>): Promise<Blog>;
  delete(id: string): Promise<void>;
  incrementViews(id: string): Promise<void>;
}

export interface TestimonialRepository {
  getAll(includeUnpublished?: boolean): Promise<Testimonial[]>;
  create(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial>;
  update(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial>;
  delete(id: string): Promise<void>;
}

export interface MessageRepository {
  getAll(): Promise<Message[]>;
  create(message: Omit<Message, 'id' | 'created_at' | 'status' | 'replies'>): Promise<Message>;
  updateStatus(id: string, status: Message['status']): Promise<Message>;
  addReply(id: string, replyText: string): Promise<Message>;
  delete(id: string): Promise<void>;
}

export interface ResumeTemplateRepository {
  getAll(): Promise<ResumeTemplate[]>;
  create(template: Omit<ResumeTemplate, 'id'>): Promise<ResumeTemplate>;
  update(id: string, template: Partial<ResumeTemplate>): Promise<ResumeTemplate>;
  delete(id: string): Promise<void>;
}

export interface MediaStorage {
  uploadFile(file: File, folderName?: string): Promise<MediaFile>;
  deleteFile(filePath: string, fileId: string): Promise<void>;
  listFiles(folderName?: string): Promise<MediaFile[]>;
  getPublicUrl(filePath: string): string;
}

export interface GitHubGateway {
  fetchRepos(username: string): Promise<any[]>;
  fetchStats(username: string): Promise<{
    stars: number;
    reposCount: number;
    languages: { [key: string]: number };
    commitsThisYear: number;
  }>;
}

export interface AIService {
  askQuestion(question: string, portfolioContext: any): Promise<string>;
}

export interface ProfileRepository {
  get(): Promise<Profile | null>;
  update(profile: Partial<Profile>): Promise<Profile>;
}

export interface AnalyticsRepository {
  trackEvent(eventType: string, details?: any): Promise<void>;
  getSummary(): Promise<AnalyticsSummary>;
}
