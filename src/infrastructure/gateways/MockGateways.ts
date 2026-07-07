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
import { 
  defaultProjects, 
  defaultSkills, 
  defaultTimelineEvents, 
  defaultAchievements, 
  defaultTestimonials, 
  defaultBlogs, 
  defaultResumeTemplates,
  defaultProfile
} from './MockData';

// Helper to load/save from localStorage
const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export class MockAuthGateway implements AuthGateway {
  async login(email: string, password?: string): Promise<{ user: any; session: any }> {
    if (email === 'admin@addisu.com' && password === 'admin123') {
      const session = { access_token: 'mock-jwt-token', expires_at: Date.now() + 3600000 };
      const user = { id: 'admin-id', email: 'admin@addisu.com', role: 'admin' };
      setLocal('portfolio_session', session);
      setLocal('portfolio_user', user);
      return { user, session };
    }
    throw new Error('Invalid email or password. Use email: admin@addisu.com and password: admin123');
  }

  async loginWithOAuth(provider: 'github' | 'google'): Promise<void> {
    const session = { access_token: `mock-oauth-${provider}-token`, expires_at: Date.now() + 3600000 };
    const user = { id: `oauth-${provider}-id`, email: `oauth-${provider}@addisu.com`, role: 'admin' };
    setLocal('portfolio_session', session);
    setLocal('portfolio_user', user);
    window.location.reload();
  }

  async logout(): Promise<void> {
    localStorage.removeItem('portfolio_session');
    localStorage.removeItem('portfolio_user');
  }

  async getSession(): Promise<any> {
    return getLocal('portfolio_session', null);
  }

  onAuthStateChange(callback: (event: string, session: any) => void): { unsubscribe: () => void } {
    const checkAuth = () => {
      const session = getLocal('portfolio_session', null);
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
    };
    window.addEventListener('storage', checkAuth);
    // Initial check
    setTimeout(checkAuth, 100);
    return {
      unsubscribe: () => {
        window.removeEventListener('storage', checkAuth);
      }
    };
  }
}

export class MockProjectRepository implements ProjectRepository {
  private key = 'portfolio_projects';

  private getItems(): Project[] {
    return getLocal(this.key, defaultProjects);
  }

  async getAll(includeUnpublished = false): Promise<Project[]> {
    const items = this.getItems();
    // Filter out unpublished or archived unless asked
    let filtered = items;
    if (!includeUnpublished) {
      filtered = filtered.filter(i => i.published && !i.archived);
    }
    // Sort: Featured first, then pinned, then sort_order, then created_at
    return filtered.sort((a, b) => {
      if (a.priority_pin !== b.priority_pin) return a.priority_pin ? -1 : 1;
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  async getById(id: string): Promise<Project> {
    const project = this.getItems().find(p => p.id === id);
    if (!project) throw new Error('Project not found');
    return project;
  }

  async getBySlug(slug: string): Promise<Project> {
    const project = this.getItems().find(p => p.slug === slug);
    if (!project) throw new Error('Project not found');
    return project;
  }

  async create(project: Omit<Project, 'id' | 'created_at' | 'views_count'>): Promise<Project> {
    const items = this.getItems();
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substring(7),
      created_at: new Date().toISOString(),
      views_count: 0
    };
    items.push(newProject);
    setLocal(this.key, items);
    return newProject;
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    const items = this.getItems();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    items[idx] = { ...items[idx], ...project };
    setLocal(this.key, items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(p => p.id !== id);
    setLocal(this.key, items);
  }

  async incrementViews(id: string): Promise<void> {
    const items = this.getItems();
    const idx = items.findIndex(p => p.id === id);
    if (idx !== -1) {
      items[idx].views_count += 1;
      setLocal(this.key, items);
    }
  }
}

export class MockTimelineRepository implements TimelineRepository {
  private key = 'portfolio_timeline';

  private getItems(): TimelineEvent[] {
    return getLocal(this.key, defaultTimelineEvents);
  }

  async getAll(): Promise<TimelineEvent[]> {
    return this.getItems().sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });
  }

  async create(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const items = this.getItems();
    const newEvent: TimelineEvent = {
      ...event,
      id: Math.random().toString(36).substring(7)
    };
    items.push(newEvent);
    setLocal(this.key, items);
    return newEvent;
  }

  async update(id: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    const items = this.getItems();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Event not found');
    items[idx] = { ...items[idx], ...event };
    setLocal(this.key, items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(p => p.id !== id);
    setLocal(this.key, items);
  }
}

export class MockSkillRepository implements SkillRepository {
  private key = 'portfolio_skills';

  private getItems(): Skill[] {
    return getLocal(this.key, defaultSkills);
  }

  async getAll(): Promise<Skill[]> {
    return this.getItems().sort((a, b) => a.sort_order - b.sort_order);
  }

  async create(skill: Omit<Skill, 'id'>): Promise<Skill> {
    const items = this.getItems();
    const newSkill: Skill = {
      ...skill,
      id: Math.random().toString(36).substring(7)
    };
    items.push(newSkill);
    setLocal(this.key, items);
    return newSkill;
  }

  async update(id: string, skill: Partial<Skill>): Promise<Skill> {
    const items = this.getItems();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Skill not found');
    items[idx] = { ...items[idx], ...skill };
    setLocal(this.key, items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(p => p.id !== id);
    setLocal(this.key, items);
  }
}

export class MockAchievementRepository implements AchievementRepository {
  private key = 'portfolio_achievements';

  private getItems(): Achievement[] {
    return getLocal(this.key, defaultAchievements);
  }

  async getAll(): Promise<Achievement[]> {
    return this.getItems()
      .filter(a => !a.archived)
      .sort((a, b) => {
        if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
        return new Date(b.date_earned).getTime() - new Date(a.date_earned).getTime();
      });
  }

  async getById(id: string): Promise<Achievement> {
    const cert = this.getItems().find(c => c.id === id);
    if (!cert) throw new Error('Certificate not found');
    return cert;
  }

  async getBySlug(slug: string): Promise<Achievement> {
    const cert = this.getItems().find(c => c.slug === slug);
    if (!cert) throw new Error('Certificate not found');
    return cert;
  }

  async create(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
    const items = this.getItems();
    const newAchievement: Achievement = {
      ...achievement,
      id: Math.random().toString(36).substring(7)
    };
    items.push(newAchievement);
    setLocal(this.key, items);
    return newAchievement;
  }

  async update(id: string, achievement: Partial<Achievement>): Promise<Achievement> {
    const items = this.getItems();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Achievement not found');
    items[idx] = { ...items[idx], ...achievement };
    setLocal(this.key, items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(p => p.id !== id);
    setLocal(this.key, items);
  }
}

export class MockBlogRepository implements BlogRepository {
  private key = 'portfolio_blogs';

  private getItems(): Blog[] {
    return getLocal(this.key, defaultBlogs);
  }

  async getAll(includeUnpublished = false): Promise<Blog[]> {
    const items = this.getItems();
    let filtered = items.filter(b => !b.archived);
    if (!includeUnpublished) {
      filtered = filtered.filter(i => i.published);
    }
    return filtered.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  async getBySlug(slug: string): Promise<Blog> {
    const blog = this.getItems().find(b => b.slug === slug);
    if (!blog) throw new Error('Blog post not found');
    return blog;
  }

  async create(blog: Omit<Blog, 'id' | 'created_at' | 'views_count'>): Promise<Blog> {
    const items = this.getItems();
    const newBlog: Blog = {
      ...blog,
      id: Math.random().toString(36).substring(7),
      views_count: 0,
      created_at: new Date().toISOString()
    };
    items.push(newBlog);
    setLocal(this.key, items);
    return newBlog;
  }

  async update(id: string, blog: Partial<Blog>): Promise<Blog> {
    const items = this.getItems();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Blog not found');
    items[idx] = { ...items[idx], ...blog };
    setLocal(this.key, items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(p => p.id !== id);
    setLocal(this.key, items);
  }

  async incrementViews(id: string): Promise<void> {
    const items = this.getItems();
    const idx = items.findIndex(b => b.id === id);
    if (idx !== -1) {
      items[idx].views_count += 1;
      setLocal(this.key, items);
    }
  }
}

export class MockTestimonialRepository implements TestimonialRepository {
  private key = 'portfolio_testimonials';

  private getItems(): Testimonial[] {
    return getLocal(this.key, defaultTestimonials);
  }

  async getAll(includeUnpublished = false): Promise<Testimonial[]> {
    const items = this.getItems();
    return includeUnpublished ? items : items.filter(i => i.published);
  }

  async create(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    const items = this.getItems();
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: Math.random().toString(36).substring(7)
    };
    items.push(newTestimonial);
    setLocal(this.key, items);
    return newTestimonial;
  }

  async update(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> {
    const items = this.getItems();
    const idx = items.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Testimonial not found');
    items[idx] = { ...items[idx], ...testimonial };
    setLocal(this.key, items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(p => p.id !== id);
    setLocal(this.key, items);
  }
}

export class MockMessageRepository implements MessageRepository {
  private key = 'portfolio_messages';

  private getItems(): Message[] {
    return getLocal(this.key, []);
  }

  async getAll(): Promise<Message[]> {
    return this.getItems().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async create(message: Omit<Message, 'id' | 'created_at' | 'status' | 'replies'>): Promise<Message> {
    const items = this.getItems();
    const newMessage: Message = {
      ...message,
      id: Math.random().toString(36).substring(7),
      status: 'unread',
      replies: [],
      created_at: new Date().toISOString()
    };
    items.push(newMessage);
    setLocal(this.key, items);
    
    // Simulate real email notification (Resend simulation)
    console.log(`[EMAIL NOTIFICATION SENT TO OWNER]: New message from ${message.sender_name} (${message.sender_email}): "${message.subject}"`);
    
    return newMessage;
  }

  async updateStatus(id: string, status: Message['status']): Promise<Message> {
    const items = this.getItems();
    const idx = items.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Message not found');
    items[idx].status = status;
    setLocal(this.key, items);
    return items[idx];
  }

  async addReply(id: string, replyText: string): Promise<Message> {
    const items = this.getItems();
    const idx = items.findIndex(m => m.id === id);
    if (idx === -1) throw new Error('Message not found');
    
    items[idx].replies.push({
      text: replyText,
      sender: 'admin',
      sent_at: new Date().toISOString()
    });
    items[idx].status = 'replied';
    setLocal(this.key, items);
    
    // Simulate email dispatch
    console.log(`[EMAIL DISPATCHED TO CLIENT ${items[idx].sender_email}]: ${replyText}`);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(m => m.id !== id);
    setLocal(this.key, items);
  }
}

export class MockResumeTemplateRepository implements ResumeTemplateRepository {
  private key = 'portfolio_resume_templates';

  private getItems(): ResumeTemplate[] {
    return getLocal(this.key, defaultResumeTemplates);
  }

  async getAll(): Promise<ResumeTemplate[]> {
    return this.getItems();
  }

  async create(template: Omit<ResumeTemplate, 'id'>): Promise<ResumeTemplate> {
    const items = this.getItems();
    const newTemplate: ResumeTemplate = {
      ...template,
      id: Math.random().toString(36).substring(7)
    };
    items.push(newTemplate);
    setLocal(this.key, items);
    return newTemplate;
  }

  async update(id: string, template: Partial<ResumeTemplate>): Promise<ResumeTemplate> {
    const items = this.getItems();
    const idx = items.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Template not found');
    items[idx] = { ...items[idx], ...template };
    setLocal(this.key, items);
    return items[idx];
  }

  async delete(id: string): Promise<void> {
    const items = this.getItems().filter(t => t.id !== id);
    setLocal(this.key, items);
  }
}

export class MockMediaStorage implements MediaStorage {
  private key = 'portfolio_media_library';

  private getItems(): MediaFile[] {
    return getLocal(this.key, []);
  }

  async uploadFile(file: File, folderName = 'root'): Promise<MediaFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const items = this.getItems();
        const newFile: MediaFile = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          file_path: reader.result as string, // base64 string mock url
          file_type: file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
            ? 'video'
            : file.name.endsWith('.pdf')
            ? 'pdf'
            : 'document',
          file_size: file.size,
          folder_name: folderName,
          created_at: new Date().toISOString()
        };
        items.push(newFile);
        setLocal(this.key, items);
        resolve(newFile);
      };
      reader.onerror = error => reject(error);
    });
  }

  async deleteFile(_filePath: string, fileId: string): Promise<void> {
    const items = this.getItems().filter(f => f.id !== fileId);
    setLocal(this.key, items);
  }

  async listFiles(folderName = 'root'): Promise<MediaFile[]> {
    return this.getItems().filter(f => f.folder_name === folderName);
  }

  getPublicUrl(filePath: string): string {
    return filePath;
  }
}

export class MockGitHubGateway implements GitHubGateway {
  async fetchRepos(username: string): Promise<any[]> {
    return [
      {
        id: 101,
        name: 'myhealthid',
        html_url: `https://github.com/${username}/myhealthid`,
        description: 'Secure digital healthcare identity platform.',
        stargazers_count: 12,
        language: 'TypeScript',
        forks_count: 3
      },
      {
        id: 102,
        name: 'eduaudio',
        html_url: `https://github.com/${username}/eduaudio`,
        description: 'Accessibility-first mobile education app.',
        stargazers_count: 24,
        language: 'JavaScript',
        forks_count: 5
      },
      {
        id: 103,
        name: 'club-connect',
        html_url: `https://github.com/${username}/club-connect`,
        description: 'Debre Berhan University campus engagement and services network.',
        stargazers_count: 8,
        language: 'TypeScript',
        forks_count: 1
      }
    ];
  }

  async fetchStats(_username: string) {
    return {
      stars: 44,
      reposCount: 8,
      languages: { TypeScript: 60, JavaScript: 25, Python: 10, Java: 5 },
      commitsThisYear: 320
    };
  }
}

export class MockAIService implements AIService {
  async askQuestion(question: string, _portfolioContext: any): Promise<string> {
    const q = question.toLowerCase();
    
    if (q.includes('health') || q.includes('myhealthid')) {
      return "MyHealthID is Addisu's secure digital healthcare identity platform. It connects patients with medical providers using zero-trust APIs to prevent data fragmentation. Built with React Native, Node.js, and PostgreSQL, it secures medical records via Biometric/QR credentials and complies fully with data privacy laws.";
    }
    if (q.includes('audio') || q.includes('eduaudio')) {
      return "EduAudio is an accessibility-first educational mobile application designed by Addisu to support blind and visually impaired students in Ethiopia. It converts digital materials into structured, high-quality local speech audio (like Amharic TTS) and works entirely offline using local caches, ensuring educational inclusion.";
    }
    if (q.includes('club') || q.includes('connect') || q.includes('student service')) {
      return "Club Connect is a university platform developed to help students discover clubs, student council elections, and services at Debre Berhan University. Built with React and Supabase, it supports real-time notices, live chat channels, and campus notices.";
    }
    if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
      return "You can download Addisu's resume dynamically in the 'Resume Builder' section. There, you can choose specialized formats (Software Engineering, AI Developer, Leadership) tailored to your recruiting requirements.";
    }
    if (q.includes('contact') || q.includes('email') || q.includes('reach')) {
      return "You can contact Addisu Yirdaw Deresse directly by using the validated Contact Form on this website or emailing him at addisulal@gmail.com. His phone, LinkedIn, and GitHub links are also detailed in the contact panel.";
    }
    if (q.includes('projects') || q.includes('portfolio') || q.includes('recommend')) {
      return "Addisu recommends reviewing: \n1. **EduAudio** (Accessibility mobile app)\n2. **MyHealthID** (Secure digital health card)\n3. **Club Connect** (Campus social directory).\nThese display his capability in React Native, accessibility optimization, API security, and database normalization.";
    }
    if (q.includes('about') || q.includes('addisu') || q.includes('who is')) {
      return `Addisu Yirdaw Deresse is a double-degree student in BSc Computer Science and Business Administration in Ethiopia. He is a remote virtual assistant, student leader, and future technology entrepreneur. He is passionate about building accessible healthcare and educational applications using AI.`;
    }
    return `Hello! I am Addisu's AI Career Assistant. I can tell you about his education, experience, and projects like MyHealthID and EduAudio, or help you contact him. What would you like to know?`;
  }
}

export class MockProfileRepository implements ProfileRepository {
  private key = 'portfolio_profile';

  async get(): Promise<Profile | null> {
    return getLocal(this.key, defaultProfile);
  }

  async update(profile: Partial<Profile>): Promise<Profile> {
    const current = getLocal(this.key, defaultProfile);
    const updated = { ...current, ...profile };
    setLocal(this.key, updated);
    return updated;
  }
}

export class MockAnalyticsRepository implements AnalyticsRepository {
  private key = 'portfolio_analytics_logs';

  private getItems(): any[] {
    return getLocal(this.key, []);
  }

  async trackEvent(eventType: string, details?: any): Promise<void> {
    const items = this.getItems();
    items.push({
      id: Math.random().toString(36).substring(7),
      event_type: eventType,
      event_details: details || {},
      created_at: new Date().toISOString()
    });
    setLocal(this.key, items);
  }

  async getSummary(): Promise<AnalyticsSummary> {
    const items = this.getItems();
    const projects = getLocal('portfolio_projects', defaultProjects);
    const blogs = getLocal('portfolio_blogs', defaultBlogs);
    const messages = getLocal('portfolio_messages', []);

    // Summarize
    const resumeDownloads = items.filter(i => i.event_type === 'resume_download').length;
    const projectViewsSum = projects.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
    const certificateViews = items.filter(i => i.event_type === 'cert_view').length;
    const blogViewsSum = blogs.reduce((acc, curr) => acc + (curr.views_count || 0), 0) + items.filter(i => i.event_type === 'blog_view').length;
    const visitors = items.filter(i => i.event_type === 'visitor_hit').length + 50; // Mock base visitors
    const githubClicks = items.filter(i => i.event_type === 'github_click').length;
    const linkedinClicks = items.filter(i => i.event_type === 'linkedin_click').length;

    return {
      visitors,
      resumeDownloads,
      projectViews: projectViewsSum,
      certificateViews,
      blogViews: blogViewsSum,
      messages: messages.length,
      githubClicks,
      linkedinClicks
    };
  }
}
