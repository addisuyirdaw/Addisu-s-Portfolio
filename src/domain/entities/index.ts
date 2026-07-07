export interface Project {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description_en: string;
  description_am?: string;
  problem_en?: string;
  solution_en?: string;
  architecture_en?: string;
  features?: string[];
  challenges_en?: string;
  lessons_en?: string;
  roadmap?: Array<{ milestone: string; stage: string; date: string }>;
  technologies: string[];
  demo_url?: string;
  github_url?: string;
  docs_url?: string;
  video_url?: string;
  figma_url?: string;
  download_url?: string;
  timeline?: string;
  category?: string;
  tags: string[];
  team_members: string[];
  screenshots: string[];
  is_featured: boolean;
  published: boolean;
  archived: boolean;
  priority_pin: boolean;
  sort_order: number;
  views_count: number;
  created_at: string;
}

export interface TimelineEvent {
  id: string;
  title_en: string;
  title_am?: string;
  organization_en: string;
  category: string; // Education, Leadership, Certificates, Hackathons, Projects, Volunteer, etc.
  start_date: string;
  end_date: string | null; // null for present
  description_en: string[];
  description_am?: string[];
  badge_url?: string;
  verification_url?: string;
  featured: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string; // Programming, Development, AI, Business, Custom
  proficiency: number; // 0 to 100
  sort_order: number;
}

export interface Achievement {
  id: string;
  title_en: string;
  slug?: string;
  issuer: string;
  date_earned: string;
  credential_url?: string;
  file_url?: string;
  badge_url?: string;
  category: string; // Certificate, Award, Badge, Publication, Fellowships, etc.
  importance: 'high' | 'medium' | 'low';
  feature_homepage: boolean;
  archived: boolean;
  sort_order: number;
  created_at?: string;
}

export interface Testimonial {
  id: string;
  author_name: string;
  author_title_en: string;
  author_company?: string;
  avatar_url?: string;
  content_en: string;
  rating: number; // 1 to 5
  published: boolean;
  created_at?: string;
}

export interface Blog {
  id: string;
  title_en: string;
  slug: string;
  content_en: string;
  category: string;
  reading_time?: string;
  cover_image?: string;
  tags: string[];
  published: boolean;
  archived: boolean;
  scheduled_at?: string;
  sort_order: number;
  views_count: number;
  created_at: string;
}

export interface MessageReply {
  text: string;
  sender: 'admin';
  sent_at: string;
}

export interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  subject?: string;
  message_text: string;
  status: 'unread' | 'read' | 'replied' | 'archived' | 'deleted';
  country?: string;
  device?: string;
  replies: MessageReply[];
  created_at: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  config: {
    skills: string[];      // skill ids
    projects: string[];    // project ids
    events: string[];      // timeline event ids
    achievements: string[]; // achievement ids
  };
  created_at?: string;
}

export interface MediaFile {
  id: string;
  name: string;
  file_path: string;
  file_type: 'image' | 'video' | 'pdf' | 'certificate' | 'document';
  file_size: number;
  folder_name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  headline: string;
  email: string;
  phone?: string;
  location?: string;
  github_url?: string;
  linkedin_url?: string;
  youtube_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  avatar_url?: string;
  resume_url?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  email_config?: {
    provider?: 'resend' | 'emailjs' | 'smtp';
    apiKey?: string;
    serviceId?: string;
    templateId?: string;
    publicKey?: string;
    toEmail?: string;
  };
}

export interface AnalyticsSummary {
  visitors: number;
  resumeDownloads: number;
  projectViews: number;
  certificateViews: number;
  blogViews: number;
  messages: number;
  githubClicks: number;
  linkedinClicks: number;
}
