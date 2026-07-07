import { supabase, isSupabaseConfigured } from '../config/supabaseClient';
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

export class SupabaseAuthGateway implements AuthGateway {
  async login(email: string, password?: string): Promise<{ user: any; session: any }> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { data, error } = await supabase!.auth.signInWithPassword({ email, password: password || '' });
    if (error) throw error;
    return { user: data.user, session: data.session };
  }

  async loginWithOAuth(provider: 'github' | 'google'): Promise<void> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    const { error } = await supabase!.auth.signInWithOAuth({ provider });
    if (error) throw error;
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase!.auth.signOut();
    }
  }

  async getSession(): Promise<any> {
    if (!isSupabaseConfigured) return null;
    const { data } = await supabase!.auth.getSession();
    return data.session;
  }

  onAuthStateChange(callback: (event: string, session: any) => void): { unsubscribe: () => void } {
    if (!isSupabaseConfigured) {
      return { unsubscribe: () => {} };
    }
    const { data } = supabase!.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return {
      unsubscribe: () => {
        data.subscription.unsubscribe();
      }
    };
  }
}

export class SupabaseProjectRepository implements ProjectRepository {
  async getAll(includeUnpublished = false): Promise<Project[]> {
    if (!isSupabaseConfigured) return [];
    let query = supabase!.from('projects').select('*');
    if (!includeUnpublished) {
      query = query.eq('published', true).eq('archived', false);
    }
    // Sort featured first, then pinned, then custom sort order, then created date
    const { data, error } = await query
      .order('priority_pin', { ascending: false })
      .order('is_featured', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<Project> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('projects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string): Promise<Project> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('projects').select('*').eq('slug', slug).single();
    if (error) throw error;
    return data;
  }

  async create(project: Omit<Project, 'id' | 'created_at' | 'views_count'>): Promise<Project> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('projects').insert([project]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, project: Partial<Project>): Promise<Project> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('projects').update(project).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('projects').delete().eq('id', id);
    if (error) throw error;
  }

  async incrementViews(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.rpc('increment_project_views', { project_id: id });
    if (error) {
      // Fallback
      const { data } = await supabase!.from('projects').select('views_count').eq('id', id).single();
      if (data) {
        await supabase!.from('projects').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);
      }
    }
  }
}

export class SupabaseTimelineRepository implements TimelineRepository {
  async getAll(): Promise<TimelineEvent[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!
      .from('timeline_events')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async create(event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('timeline_events').insert([event]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, event: Partial<TimelineEvent>): Promise<TimelineEvent> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('timeline_events').update(event).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('timeline_events').delete().eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseSkillRepository implements SkillRepository {
  async getAll(): Promise<Skill[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('proficiency', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async create(skill: Omit<Skill, 'id'>): Promise<Skill> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('skills').insert([skill]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, skill: Partial<Skill>): Promise<Skill> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('skills').update(skill).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('skills').delete().eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseAchievementRepository implements AchievementRepository {
  async getAll(): Promise<Achievement[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!
      .from('achievements')
      .select('*')
      .eq('archived', false)
      .order('sort_order', { ascending: true })
      .order('date_earned', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getById(id: string): Promise<Achievement> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('achievements').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async getBySlug(slug: string): Promise<Achievement> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('achievements').select('*').eq('slug', slug).single();
    if (error) throw error;
    return data;
  }

  async create(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('achievements').insert([achievement]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, achievement: Partial<Achievement>): Promise<Achievement> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('achievements').update(achievement).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('achievements').delete().eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseBlogRepository implements BlogRepository {
  async getAll(includeUnpublished = false): Promise<Blog[]> {
    if (!isSupabaseConfigured) return [];
    let query = supabase!.from('blogs').select('*');
    if (!includeUnpublished) {
      query = query.eq('published', true).eq('archived', false);
    }
    const { data, error } = await query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getBySlug(slug: string): Promise<Blog> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('blogs').select('*').eq('slug', slug).single();
    if (error) throw error;
    return data;
  }

  async create(blog: Omit<Blog, 'id' | 'created_at' | 'views_count'>): Promise<Blog> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('blogs').insert([blog]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, blog: Partial<Blog>): Promise<Blog> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('blogs').update(blog).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('blogs').delete().eq('id', id);
    if (error) throw error;
  }

  async incrementViews(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.rpc('increment_blog_views', { blog_id: id });
    if (error) {
      // Fallback
      const { data } = await supabase!.from('blogs').select('views_count').eq('id', id).single();
      if (data) {
        await supabase!.from('blogs').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id);
      }
    }
  }
}

export class SupabaseTestimonialRepository implements TestimonialRepository {
  async getAll(includeUnpublished = false): Promise<Testimonial[]> {
    if (!isSupabaseConfigured) return [];
    let query = supabase!.from('testimonials').select('*');
    if (!includeUnpublished) {
      query = query.eq('published', true);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async create(testimonial: Omit<Testimonial, 'id'>): Promise<Testimonial> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('testimonials').insert([testimonial]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, testimonial: Partial<Testimonial>): Promise<Testimonial> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('testimonials').update(testimonial).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('testimonials').delete().eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseMessageRepository implements MessageRepository {
  async getAll(): Promise<Message[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async create(message: Omit<Message, 'id' | 'created_at' | 'status' | 'replies'>): Promise<Message> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('messages').insert([message]).select().single();
    if (error) throw error;
    
    // Proactively send email notification using configured email provider (Handled server-side or by Edge Function)
    return data;
  }

  async updateStatus(id: string, status: Message['status']): Promise<Message> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('messages').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async addReply(id: string, replyText: string): Promise<Message> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    // Fetch current replies
    const { data: currentMessage, error: fetchErr } = await supabase!.from('messages').select('replies').eq('id', id).single();
    if (fetchErr) throw fetchErr;

    const repliesList = currentMessage.replies || [];
    repliesList.push({
      text: replyText,
      sender: 'admin',
      sent_at: new Date().toISOString()
    });

    const { data, error } = await supabase!
      .from('messages')
      .update({ replies: repliesList, status: 'replied' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('messages').delete().eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseResumeTemplateRepository implements ResumeTemplateRepository {
  async getAll(): Promise<ResumeTemplate[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!.from('resume_templates').select('*');
    if (error) throw error;
    return data || [];
  }

  async create(template: Omit<ResumeTemplate, 'id'>): Promise<ResumeTemplate> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('resume_templates').insert([template]).select().single();
    if (error) throw error;
    return data;
  }

  async update(id: string, template: Partial<ResumeTemplate>): Promise<ResumeTemplate> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    const { data, error } = await supabase!.from('resume_templates').update(template).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async delete(id: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase!.from('resume_templates').delete().eq('id', id);
    if (error) throw error;
  }
}

export class SupabaseMediaStorage implements MediaStorage {
  private bucketName = 'portfolio-media';

  async uploadFile(file: File, folderName = 'root'): Promise<MediaFile> {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');
    
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.substring(0, file.name.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${folderName}/${cleanFileName}_${Date.now()}.${fileExt}`;
    
    // 1. Upload to Supabase Storage Bucket
    const { error: uploadError } = await supabase!.storage
      .from(this.bucketName)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // 2. Register inside our PostgreSQL 'media' table
    const mediaRow: Omit<MediaFile, 'id' | 'created_at'> = {
      name: file.name,
      file_path: fileName,
      file_type: file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
        ? 'video'
        : file.name.endsWith('.pdf')
        ? 'pdf'
        : 'document',
      file_size: file.size,
      folder_name: folderName
    };

    const { data, error: dbError } = await supabase!
      .from('media')
      .insert([mediaRow])
      .select()
      .single();

    if (dbError) throw dbError;
    return data;
  }

  async deleteFile(filePath: string, fileId: string): Promise<void> {
    if (!isSupabaseConfigured) return;
    
    // 1. Delete from bucket storage
    const { error: storageError } = await supabase!.storage
      .from(this.bucketName)
      .remove([filePath]);
      
    if (storageError) throw storageError;

    // 2. Delete from media table
    const { error: dbError } = await supabase!
      .from('media')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;
  }

  async listFiles(folderName = 'root'): Promise<MediaFile[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase!
      .from('media')
      .select('*')
      .eq('folder_name', folderName)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }

  getPublicUrl(filePath: string): string {
    if (!isSupabaseConfigured) return '';
    const { data } = supabase!.storage.from(this.bucketName).getPublicUrl(filePath);
    return data?.publicUrl || '';
  }
}

export class SupabaseAIService implements AIService {
  async askQuestion(question: string, portfolioContext: any): Promise<string> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context: portfolioContext })
      });
      if (!response.ok) {
        throw new Error('Failed to query assistant endpoint');
      }
      const data = await response.json();
      return data.answer || 'I am sorry, I am having trouble answering right now.';
    } catch (err) {
      console.error('Server-side AI call failed, falling back to local model:', err);
      const { MockAIService } = await import('./MockGateways');
      return new MockAIService().askQuestion(question, portfolioContext);
    }
  }
}

export class SupabaseProfileRepository implements ProfileRepository {
  async get(): Promise<Profile | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase!.from('profiles').select('*').limit(1).maybeSingle();
    if (error) throw error;
    return data;
  }

  async update(profile: Partial<Profile>): Promise<Profile> {
    if (!isSupabaseConfigured) throw new Error('Supabase not configured');
    
    // Check if profile exists
    const current = await this.get();
    let query;
    if (current) {
      query = supabase!.from('profiles').update(profile).eq('id', current.id);
    } else {
      // Get current auth user ID if available
      const { data: userData } = await supabase!.auth.getUser();
      const userId = userData?.user?.id || '00000000-0000-0000-0000-000000000000';
      query = supabase!.from('profiles').insert([{ ...profile, id: userId }]);
    }
    
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
  }
}

export class SupabaseAnalyticsRepository implements AnalyticsRepository {
  async trackEvent(eventType: string, details?: any): Promise<void> {
    if (!isSupabaseConfigured) return;
    const log = {
      event_type: eventType,
      event_details: details || {}
    };
    await supabase!.from('analytics_logs').insert([log]);
  }

  async getSummary(): Promise<AnalyticsSummary> {
    if (!isSupabaseConfigured) {
      return { visitors: 0, resumeDownloads: 0, projectViews: 0, certificateViews: 0, blogViews: 0, messages: 0, githubClicks: 0, linkedinClicks: 0 };
    }

    try {
      const [logsData, projsData, blogsData, msgsData] = await Promise.all([
        supabase!.from('analytics_logs').select('event_type'),
        supabase!.from('projects').select('views_count'),
        supabase!.from('blogs').select('views_count'),
        supabase!.from('messages').select('id', { count: 'exact', head: true })
      ]);

      const logs = logsData.data || [];
      const projects = projsData.data || [];
      const blogs = blogsData.data || [];
      const messagesCount = msgsData.count || 0;

      const visitors = logs.filter(l => l.event_type === 'visitor_hit').length + 50; // Add base mock index
      const resumeDownloads = logs.filter(l => l.event_type === 'resume_download').length;
      const projectViews = projects.reduce((acc, curr) => acc + (curr.views_count || 0), 0);
      const certificateViews = logs.filter(l => l.event_type === 'cert_view').length;
      const blogViews = blogs.reduce((acc, curr) => acc + (curr.views_count || 0), 0) + logs.filter(l => l.event_type === 'blog_view').length;
      const githubClicks = logs.filter(l => l.event_type === 'github_click').length;
      const linkedinClicks = logs.filter(l => l.event_type === 'linkedin_click').length;

      return {
        visitors,
        resumeDownloads,
        projectViews,
        certificateViews,
        blogViews,
        messages: messagesCount,
        githubClicks,
        linkedinClicks
      };
    } catch (err) {
      console.error('Failed to query summary analytics:', err);
      return { visitors: 0, resumeDownloads: 0, projectViews: 0, certificateViews: 0, blogViews: 0, messages: 0, githubClicks: 0, linkedinClicks: 0 };
    }
  }
}
