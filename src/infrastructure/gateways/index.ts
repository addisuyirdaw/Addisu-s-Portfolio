import { isSupabaseConfigured } from '../config/supabaseClient';
import type { 
  AuthGateway, 
  ProjectRepository, 
  TimelineRepository, 
  SkillRepository, 
  AchievementRepository, 
  BlogRepository, 
  TestimonialRepository, 
  MessageRepository, 
  ResumeTemplateRepository,
  MediaStorage,
  GitHubGateway,
  AIService,
  ProfileRepository,
  AnalyticsRepository
} from '../../application/ports';
import { 
  MockAuthGateway, 
  MockProjectRepository, 
  MockTimelineRepository, 
  MockSkillRepository, 
  MockAchievementRepository, 
  MockBlogRepository, 
  MockTestimonialRepository, 
  MockMessageRepository, 
  MockResumeTemplateRepository,
  MockMediaStorage,
  MockGitHubGateway,
  MockAIService,
  MockProfileRepository,
  MockAnalyticsRepository
} from './MockGateways';
import { 
  SupabaseAuthGateway, 
  SupabaseProjectRepository, 
  SupabaseTimelineRepository, 
  SupabaseSkillRepository, 
  SupabaseAchievementRepository, 
  SupabaseBlogRepository, 
  SupabaseTestimonialRepository, 
  SupabaseMessageRepository, 
  SupabaseResumeTemplateRepository,
  SupabaseMediaStorage,
  SupabaseAIService,
  SupabaseProfileRepository,
  SupabaseAnalyticsRepository
} from './SupabaseGateways';

// Instantiation & Selection
export const authGateway: AuthGateway = isSupabaseConfigured ? new SupabaseAuthGateway() : new MockAuthGateway();
export const projectRepository: ProjectRepository = isSupabaseConfigured ? new SupabaseProjectRepository() : new MockProjectRepository();
export const timelineRepository: TimelineRepository = isSupabaseConfigured ? new SupabaseTimelineRepository() : new MockTimelineRepository();
export const skillRepository: SkillRepository = isSupabaseConfigured ? new SupabaseSkillRepository() : new MockSkillRepository();
export const achievementRepository: AchievementRepository = isSupabaseConfigured ? new SupabaseAchievementRepository() : new MockAchievementRepository();
export const blogRepository: BlogRepository = isSupabaseConfigured ? new SupabaseBlogRepository() : new MockBlogRepository();
export const testimonialRepository: TestimonialRepository = isSupabaseConfigured ? new SupabaseTestimonialRepository() : new MockTestimonialRepository();
export const messageRepository: MessageRepository = isSupabaseConfigured ? new SupabaseMessageRepository() : new MockMessageRepository();
export const resumeTemplateRepository: ResumeTemplateRepository = isSupabaseConfigured ? new SupabaseResumeTemplateRepository() : new MockResumeTemplateRepository();
export const mediaStorage: MediaStorage = isSupabaseConfigured ? new SupabaseMediaStorage() : new MockMediaStorage();
export const gitHubGateway: GitHubGateway = new MockGitHubGateway(); // Always use GitHub direct client
export const aiService: AIService = isSupabaseConfigured ? new SupabaseAIService() : new MockAIService();
export const profileRepository: ProfileRepository = isSupabaseConfigured ? new SupabaseProfileRepository() : new MockProfileRepository();
export const analyticsRepository: AnalyticsRepository = isSupabaseConfigured ? new SupabaseAnalyticsRepository() : new MockAnalyticsRepository();

export const isSupabaseMode = isSupabaseConfigured;
