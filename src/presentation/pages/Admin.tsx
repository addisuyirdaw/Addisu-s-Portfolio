import React, { useState, useEffect } from 'react';
import { 
  authGateway, 
  projectRepository, 
  skillRepository, 
  timelineRepository, 
  achievementRepository, 
  messageRepository,
  profileRepository,
  analyticsRepository,
  blogRepository,
  testimonialRepository,
  isSupabaseMode
} from '../../infrastructure/gateways';
import type { 
  Project, 
  Skill, 
  TimelineEvent, 
  Achievement, 
  Message, 
  Blog, 
  Testimonial, 
  Profile, 
  AnalyticsSummary 
} from '../../domain/entities';
import { MediaManager } from '../components/MediaManager';
import { EmailService } from '../../domain/services/EmailService';
import { 
  LayoutDashboard, 
  FolderGit, 
  Milestone, 
  Sliders, 
  Award, 
  Inbox, 
  Image as ImageIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Database,
  BookOpen,
  Heart,
  Send,
  Upload,
  RefreshCw
} from 'lucide-react';

// localStorage helper for backup/restore
const setLocal = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error' | 'mock'; message: string } | null>(null);

  // Account Security States
  const [securityEmail, setSecurityEmail] = useState('');
  const [securityPassword, setSecurityPassword] = useState('');
  const [securityConfirmPassword, setSecurityConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'timeline' | 'skills' | 'certs' | 'blogs' | 'testimonials' | 'media' | 'inbox' | 'settings'>('dashboard');

  // DB Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [certs, setCerts] = useState<Achievement[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    visitors: 0, resumeDownloads: 0, projectViews: 0, certificateViews: 0, blogViews: 0, messages: 0, githubClicks: 0, linkedinClicks: 0
  });

  // Editing Modals / Form States
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'project' | 'timeline' | 'skill' | 'cert' | 'blog' | 'testimonial' | null>(null);

  // Message Reply States
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  // Form Fields States
  const [projectForm, setProjectForm] = useState({
    title: '',
    slug: '',
    subtitle: '',
    description_en: '',
    problem_en: '',
    solution_en: '',
    architecture_en: '',
    features: '',
    roadmap: '',
    technologies: '',
    demo_url: '',
    github_url: '',
    docs_url: '',
    video_url: '',
    figma_url: '',
    download_url: '',
    timeline: '',
    category: 'Software Projects',
    tags: '',
    team_members: '',
    screenshots: '',
    is_featured: false,
    published: true,
    archived: false,
    priority_pin: false,
    sort_order: 0
  });

  const [skillForm, setSkillForm] = useState({
    name: '',
    category: 'Programming',
    proficiency: 80,
    sort_order: 0
  });

  const [timelineForm, setTimelineForm] = useState({
    title_en: '',
    organization_en: '',
    category: 'Education',
    start_date: '',
    end_date: '',
    description_en: '',
    featured: false,
    sort_order: 0
  });

  const [certForm, setCertForm] = useState({
    title_en: '',
    slug: '',
    issuer: '',
    date_earned: '',
    credential_url: '',
    file_url: '',
    category: 'Certificate',
    importance: 'medium' as Achievement['importance'],
    feature_homepage: true,
    archived: false,
    sort_order: 0
  });

  const [blogForm, setBlogForm] = useState({
    title_en: '',
    slug: '',
    content_en: '',
    category: 'Engineering',
    reading_time: '5 min read',
    cover_image: '',
    tags: '',
    published: true,
    archived: false,
    sort_order: 0
  });

  const [testimonialForm, setTestimonialForm] = useState({
    author_name: '',
    author_title_en: '',
    author_company: '',
    avatar_url: '',
    content_en: '',
    rating: 5,
    published: true
  });

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    github_url: '',
    linkedin_url: '',
    youtube_url: '',
    twitter_url: '',
    instagram_url: '',
    facebook_url: '',
    avatar_url: '',
    resume_url: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    email_provider: 'resend',
    email_apiKey: '',
    email_serviceId: '',
    email_templateId: '',
    email_publicKey: '',
    email_toEmail: ''
  });

  const refreshData = async () => {
    try {
      const [projs, sks, times, achievements, posts, tests, msgs, prof, statsData] = await Promise.all([
        projectRepository.getAll(true),
        skillRepository.getAll(),
        timelineRepository.getAll(),
        achievementRepository.getAll(),
        blogRepository.getAll(true),
        testimonialRepository.getAll(true),
        messageRepository.getAll(),
        profileRepository.get(),
        analyticsRepository.getSummary()
      ]);
      setProjects(projs);
      setSkills(sks);
      setTimeline(times);
      setCerts(achievements);
      setBlogs(posts);
      setTestimonials(tests);
      setMessages(msgs);
      setProfile(prof);
      setAnalytics(statsData);

      if (prof) {
        setProfileForm({
          full_name: prof.full_name || '',
          headline: prof.headline || '',
          email: prof.email || '',
          phone: prof.phone || '',
          location: prof.location || '',
          github_url: prof.github_url || '',
          linkedin_url: prof.linkedin_url || '',
          youtube_url: prof.youtube_url || '',
          twitter_url: prof.twitter_url || '',
          instagram_url: prof.instagram_url || '',
          facebook_url: prof.facebook_url || '',
          avatar_url: prof.avatar_url || '',
          resume_url: prof.resume_url || '',
          seo_title: prof.seo_title || '',
          seo_description: prof.seo_description || '',
          seo_keywords: prof.seo_keywords || '',
          email_provider: prof.email_config?.provider || 'resend',
          email_apiKey: prof.email_config?.apiKey || '',
          email_serviceId: prof.email_config?.serviceId || '',
          email_templateId: prof.email_config?.templateId || '',
          email_publicKey: prof.email_config?.publicKey || '',
          email_toEmail: prof.email_config?.toEmail || ''
        });
      }
    } catch (err) {
      console.error('Failed to reload admin datasets:', err);
    }
  };

  useEffect(() => {
    // Check local session
    authGateway.getSession().then((session: any) => {
      if (session) {
        setIsAuthenticated(true);
        if (session.user?.email) {
          setSecurityEmail(session.user.email);
        }
        refreshData();
      }
    });

    // Check failed attempts lockout
    const savedLock = localStorage.getItem('portfolio_auth_lockout');
    if (savedLock) {
      const lockDate = parseInt(savedLock, 10);
      if (Date.now() < lockDate) {
        setLockoutTime(lockDate);
      } else {
        localStorage.removeItem('portfolio_auth_lockout');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (lockoutTime && Date.now() < lockoutTime) {
      const remainingSecs = Math.ceil((lockoutTime - Date.now()) / 1000);
      setAuthError(`Too many failed login attempts. Locked out for ${remainingSecs} seconds.`);
      return;
    }

    try {
      await authGateway.login(email, password);
      setIsAuthenticated(true);
      setLoginAttempts(0);
      refreshData();
    } catch (err: any) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (newAttempts >= 5) {
        const lockDuration = Date.now() + 5 * 60 * 1000;
        setLockoutTime(lockDuration);
        localStorage.setItem('portfolio_auth_lockout', lockDuration.toString());
        setAuthError('Too many failed login attempts. You are locked out for 5 minutes.');
      } else {
        setAuthError(err.message || 'Authentication failed.');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    setForgotLoading(true);
    try {
      if (!isSupabaseMode) {
        // Mock mode: simulate and inform
        await authGateway.resetPasswordForEmail(forgotEmail, '');
        setForgotStatus({
          type: 'mock',
          message:
            '⚠️ Running in Mock Mode — no real email is sent. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable real password reset emails.'
        });
      } else {
        const redirectTo = `${window.location.origin}/reset-password`;
        await authGateway.resetPasswordForEmail(forgotEmail, redirectTo);
        setForgotStatus({
          type: 'success',
          message: `✅ Reset link sent to ${forgotEmail}. Check your inbox and click the link to set a new password.`
        });
        setForgotEmail('');
      }
    } catch (err: any) {
      setForgotStatus({ type: 'error', message: err.message || 'Failed to send reset email.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogout = async () => {
    await authGateway.logout();
    setIsAuthenticated(false);
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (securityPassword && securityPassword !== securityConfirmPassword) {
      setSecurityError('Passwords do not match.');
      return;
    }

    try {
      await authGateway.updateUser(
        securityEmail || undefined,
        securityPassword || undefined
      );

      setSecuritySuccess('Credentials updated successfully. You will be logged out in 2 seconds...');
      
      setTimeout(async () => {
        await handleLogout();
        // Clear secure states
        setSecurityPassword('');
        setSecurityConfirmPassword('');
        setSecuritySuccess('');
      }, 2000);
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update credentials.');
    }
  };

  // Automated SEO Slug Generator
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'project') {
        const payload = {
          ...projectForm,
          technologies: projectForm.technologies.split(',').map(t => t.trim()).filter(Boolean),
          tags: projectForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          team_members: projectForm.team_members.split(',').map(t => t.trim()).filter(Boolean),
          screenshots: projectForm.screenshots.split('\n').map(t => t.trim()).filter(Boolean),
          features: projectForm.features.split('\n').map(f => f.trim()).filter(Boolean),
          roadmap: projectForm.roadmap.split('\n').map(r => {
            const parts = r.split('|');
            return {
              milestone: parts[0]?.trim() || '',
              stage: parts[1]?.trim() || 'Planning',
              date: parts[2]?.trim() || ''
            };
          }).filter(r => r.milestone)
        };

        if (editingId) {
          await projectRepository.update(editingId, payload);
        } else {
          await projectRepository.create(payload);
        }
      } 
      
      else if (modalType === 'skill') {
        if (editingId) {
          await skillRepository.update(editingId, skillForm);
        } else {
          await skillRepository.create(skillForm);
        }
      } 
      
      else if (modalType === 'timeline') {
        const payload = {
          ...timelineForm,
          end_date: timelineForm.end_date || null,
          description_en: timelineForm.description_en.split('\n').map(b => b.trim()).filter(Boolean)
        };
        if (editingId) {
          await timelineRepository.update(editingId, payload);
        } else {
          await timelineRepository.create(payload);
        }
      } 
      
      else if (modalType === 'cert') {
        if (editingId) {
          await achievementRepository.update(editingId, certForm);
        } else {
          await achievementRepository.create(certForm);
        }
      } 
      
      else if (modalType === 'blog') {
        const payload = {
          ...blogForm,
          tags: blogForm.tags.split(',').map(t => t.trim()).filter(Boolean)
        };
        if (editingId) {
          await blogRepository.update(editingId, payload);
        } else {
          await blogRepository.create(payload);
        }
      } 
      
      else if (modalType === 'testimonial') {
        if (editingId) {
          await testimonialRepository.update(editingId, testimonialForm);
        } else {
          await testimonialRepository.create(testimonialForm);
        }
      }

      setShowModal(false);
      setEditingId(null);
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Error saving record.');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Profile> = {
        full_name: profileForm.full_name,
        headline: profileForm.headline,
        email: profileForm.email,
        phone: profileForm.phone,
        location: profileForm.location,
        github_url: profileForm.github_url,
        linkedin_url: profileForm.linkedin_url,
        youtube_url: profileForm.youtube_url,
        twitter_url: profileForm.twitter_url,
        instagram_url: profileForm.instagram_url,
        facebook_url: profileForm.facebook_url,
        avatar_url: profileForm.avatar_url,
        resume_url: profileForm.resume_url,
        seo_title: profileForm.seo_title,
        seo_description: profileForm.seo_description,
        seo_keywords: profileForm.seo_keywords,
        email_config: {
          provider: profileForm.email_provider as any,
          apiKey: profileForm.email_apiKey,
          serviceId: profileForm.email_serviceId,
          templateId: profileForm.email_templateId,
          publicKey: profileForm.email_publicKey,
          toEmail: profileForm.email_toEmail
        }
      };

      await profileRepository.update(payload);
      alert('CMS Configuration Profile Saved Successfully!');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to update system settings.');
    }
  };

  // CRUD Delete
  const handleDeleteItem = async (id: string, type: 'project' | 'timeline' | 'skill' | 'cert' | 'blog' | 'testimonial') => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${type}?`)) return;
    try {
      if (type === 'project') await projectRepository.delete(id);
      if (type === 'timeline') await timelineRepository.delete(id);
      if (type === 'skill') await skillRepository.delete(id);
      if (type === 'cert') await achievementRepository.delete(id);
      if (type === 'blog') await blogRepository.delete(id);
      if (type === 'testimonial') await testimonialRepository.delete(id);
      refreshData();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleMessageStatus = async (id: string, status: Message['status']) => {
    try {
      await messageRepository.updateStatus(id, status);
      refreshData();
    } catch (err) {
      alert('Failed to update message status.');
    }
  };

  const handleMessageDelete = async (id: string) => {
    if (!window.confirm('Delete this contact message?')) return;
    try {
      await messageRepository.delete(id);
      refreshData();
    } catch (err) {
      alert('Delete failed.');
    }
  };

  // Outgoing email reply compiler
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessageId || !replyText) return;
    setReplying(true);

    try {
      const msg = messages.find(m => m.id === replyMessageId);
      if (!msg) throw new Error('Reference message not found');
      
      // Dispatch email reply asynchronously using CMS config credentials
      if (profile) {
        await EmailService.sendReply(profile, msg.sender_email, msg.sender_name, replySubject || `Re: ${msg.subject || 'Portfolio Query'}`, replyText);
      }

      await messageRepository.addReply(replyMessageId, replyText);
      
      alert('Reply email dispatched and logged successfully!');
      setReplyMessageId(null);
      setReplyText('');
      setReplySubject('');
      refreshData();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch reply email.');
    } finally {
      setReplying(false);
    }
  };

  // JSON Database Import/Export Backups
  const exportDatabase = () => {
    const data = {
      projects: isSupabaseMode ? projects : JSON.parse(localStorage.getItem('portfolio_projects') || '[]'),
      skills: isSupabaseMode ? skills : JSON.parse(localStorage.getItem('portfolio_skills') || '[]'),
      timeline: isSupabaseMode ? timeline : JSON.parse(localStorage.getItem('portfolio_timeline') || '[]'),
      achievements: isSupabaseMode ? certs : JSON.parse(localStorage.getItem('portfolio_achievements') || '[]'),
      testimonials: isSupabaseMode ? testimonials : JSON.parse(localStorage.getItem('portfolio_testimonials') || '[]'),
      blogs: isSupabaseMode ? blogs : JSON.parse(localStorage.getItem('portfolio_blogs') || '[]'),
      profile: profile
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `career-platform-backup-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm('Importing this backup will overwrite existing local storage configuration. Proceed?')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (isSupabaseMode) {
          // Iterate and insert into Supabase
          alert('Supabase DB imports should be handled via SQL script backup to prevent policy violations. Direct import loaded in memory.');
        } else {
          if (data.projects) setLocal('portfolio_projects', data.projects);
          if (data.skills) setLocal('portfolio_skills', data.skills);
          if (data.timeline) setLocal('portfolio_timeline', data.timeline);
          if (data.achievements) setLocal('portfolio_achievements', data.achievements);
          if (data.testimonials) setLocal('portfolio_testimonials', data.testimonials);
          if (data.blogs) setLocal('portfolio_blogs', data.blogs);
          if (data.profile) setLocal('portfolio_profile', data.profile);
          alert('Local Storage Configuration Backed Up Successfully! Reloading...');
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid backup JSON format.');
      }
    };
    reader.readAsText(file);
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="glass-panel auth-card">
          <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', fontWeight: 800 }}>
            CMS Administrator Login
          </h2>

          {!showForgotPassword ? (
            // ── Login Form ──────────────────────────────────────────────────
            <>
              <form onSubmit={handleLogin}>
                {authError && (
                  <div style={{ padding: '10px', background: 'rgba(225,29,72,0.1)', border: '1px solid #e11d48', borderRadius: '8px', color: '#e11d48', marginBottom: '15px', fontSize: '0.85rem' }}>
                    {authError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    id="admin-email"
                    type="email"
                    className="form-input"
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Security Password</label>
                  <input
                    id="admin-password"
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button id="admin-login-btn" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  Authenticate Credentials
                </button>
              </form>

              {/* Forgot Password link */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  id="forgot-password-toggle"
                  type="button"
                  onClick={() => { setShowForgotPassword(true); setForgotStatus(null); setForgotEmail(''); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'hsl(var(--accent))',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            </>
          ) : (
            // ── Forgot Password Panel ────────────────────────────────────
            <>
              <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', marginBottom: '16px', textAlign: 'center' }}>
                Enter your admin email and we'll send you a secure reset link.
              </p>

              {forgotStatus && (
                <div style={{
                  padding: '12px',
                  background: forgotStatus.type === 'success'
                    ? 'rgba(34,197,94,0.12)'
                    : forgotStatus.type === 'mock'
                    ? 'rgba(245,158,11,0.12)'
                    : 'rgba(225,29,72,0.1)',
                  border: `1px solid ${forgotStatus.type === 'success' ? '#22c55e' : forgotStatus.type === 'mock' ? '#f59e0b' : '#e11d48'}`,
                  borderRadius: '8px',
                  color: forgotStatus.type === 'success' ? '#22c55e' : forgotStatus.type === 'mock' ? '#f59e0b' : '#e11d48',
                  marginBottom: '16px',
                  fontSize: '0.82rem',
                  lineHeight: 1.5
                }}>
                  {forgotStatus.message}
                </div>
              )}

              <form onSubmit={handleForgotPassword}>
                <div className="form-group">
                  <label className="form-label">Admin Email Address</label>
                  <input
                    id="forgot-email"
                    type="email"
                    className="form-input"
                    placeholder="your-email@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  id="send-reset-link-btn"
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button
                  id="back-to-login-btn"
                  type="button"
                  onClick={() => { setShowForgotPassword(false); setForgotStatus(null); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'hsl(var(--text-muted))',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Admin Navigation */}
      <aside className="admin-sidebar" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <ul className="admin-sidebar-nav">
          <li className={`admin-sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Metrics</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
            <FolderGit size={18} />
            <span>Projects</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
            <Milestone size={18} />
            <span>Timeline</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>
            <Sliders size={18} />
            <span>Skills Set</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'certs' ? 'active' : ''}`} onClick={() => setActiveTab('certs')}>
            <Award size={18} />
            <span>Certificates</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'blogs' ? 'active' : ''}`} onClick={() => setActiveTab('blogs')}>
            <BookOpen size={18} />
            <span>Blogs CMS</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'testimonials' ? 'active' : ''}`} onClick={() => setActiveTab('testimonials')}>
            <Heart size={18} />
            <span>Testimonials</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
            <ImageIcon size={18} />
            <span>Media Library</span>
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Inbox size={18} />
              <span>Inbox</span>
            </div>
            {messages.filter(m => m.status === 'unread').length > 0 && (
              <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#e11d48', borderRadius: '10px', color: '#fff', fontWeight: 800 }}>
                {messages.filter(m => m.status === 'unread').length}
              </span>
            )}
          </li>
          <li className={`admin-sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <SettingsIcon size={18} />
            <span>Settings</span>
          </li>
        </ul>

        <button 
          className="admin-sidebar-link" 
          onClick={handleLogout}
          style={{ border: 'none', background: 'none', width: '100%', borderTop: '1px solid var(--border-glass)', marginTop: '20px' }}
        >
          <LogOut size={18} />
          <span>Disconnect</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">
        
        {/* Tab 1: Dashboard Analytics */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '20px' }}>Platform Metrics Dashboard</h2>
            
            {/* Stat Cards */}
            <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
              <div className="glass-card analytics-stat-card" style={{ margin: 0 }}>
                <span className="stat-label">Unique Visitors</span>
                <div className="stat-value">{analytics.visitors}</div>
              </div>
              <div className="glass-card analytics-stat-card" style={{ margin: 0 }}>
                <span className="stat-label">Resume Downloads</span>
                <div className="stat-value">{analytics.resumeDownloads}</div>
              </div>
              <div className="glass-card analytics-stat-card" style={{ margin: 0 }}>
                <span className="stat-label">Project Views</span>
                <div className="stat-value">{analytics.projectViews}</div>
              </div>
              <div className="glass-card analytics-stat-card" style={{ margin: 0 }}>
                <span className="stat-label">Certificate Views</span>
                <div className="stat-value">{analytics.certificateViews}</div>
              </div>
              <div className="glass-card analytics-stat-card" style={{ margin: 0 }}>
                <span className="stat-label">Blog Article Views</span>
                <div className="stat-value">{analytics.blogViews}</div>
              </div>
              <div className="glass-card analytics-stat-card" style={{ margin: 0 }}>
                <span className="stat-label">GitHub Link Clicks</span>
                <div className="stat-value">{analytics.githubClicks}</div>
              </div>
            </div>

            {/* Visual Analytics Bar Graph */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>Project Views Allocation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {projects.slice(0, 5).map(p => {
                    const pct = analytics.projectViews > 0 ? (p.views_count / analytics.projectViews) * 100 : 0;
                    return (
                      <div key={p.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span>{p.title}</span>
                          <span>{p.views_count} views ({pct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ height: '8px', background: 'var(--border-glass)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent-gradient)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '15px' }}>System Info & Storage Mode</h3>
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>
                  <strong>Mode:</strong> {isSupabaseMode ? '🚀 Supabase Production Database' : '💾 LocalStorage Sandbox'} <br/>
                  <strong>Email Alerts Status:</strong> {profile?.email_config?.provider ? `✅ Enabled (${profile.email_config.provider})` : '❌ Disabled'} <br/>
                  <strong>Database Backup Index:</strong> {projects.length + skills.length + certs.length + blogs.length} entities recorded.
                </p>
                <button className="btn btn-secondary" style={{ marginTop: '15px' }} onClick={refreshData}>
                  <RefreshCw size={14} style={{ marginRight: '6px' }} /> Sync Metrics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects CRUD */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Manage Case Study Projects</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setModalType('project');
                  setEditingId(null);
                  setProjectForm({
                    title: '',
                    slug: '',
                    subtitle: '',
                    description_en: '',
                    problem_en: '',
                    solution_en: '',
                    architecture_en: '',
                    features: '',
                    roadmap: '',
                    technologies: '',
                    demo_url: '',
                    github_url: '',
                    docs_url: '',
                    video_url: '',
                    figma_url: '',
                    download_url: '',
                    timeline: '',
                    category: 'Software Projects',
                    tags: '',
                    team_members: '',
                    screenshots: '',
                    is_featured: false,
                    published: true,
                    archived: false,
                    priority_pin: false,
                    sort_order: projects.length + 1
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                <span>New Project</span>
              </button>
            </div>

            <div className="glass-panel cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Pin</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Technologies</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(p => (
                    <tr key={p.id} style={{ opacity: p.archived ? 0.5 : 1 }}>
                      <td>{p.priority_pin ? '📌' : ''}</td>
                      <td style={{ fontWeight: 700 }}>{p.title}</td>
                      <td>{p.category}</td>
                      <td>{p.technologies.slice(0, 3).join(', ')}</td>
                      <td>
                        <span className={`badge-status ${p.archived ? 'draft' : p.published ? 'published' : 'draft'}`}>
                          {p.archived ? 'Archived' : p.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="nav-btn" 
                            onClick={() => {
                              setModalType('project');
                              setEditingId(p.id);
                              setProjectForm({
                                title: p.title,
                                slug: p.slug,
                                subtitle: p.subtitle || '',
                                description_en: p.description_en,
                                problem_en: p.problem_en || '',
                                solution_en: p.solution_en || '',
                                architecture_en: p.architecture_en || '',
                                features: p.features?.join('\n') || '',
                                roadmap: p.roadmap?.map(r => `${r.milestone} | ${r.stage} | ${r.date}`).join('\n') || '',
                                technologies: p.technologies.join(', '),
                                demo_url: p.demo_url || '',
                                github_url: p.github_url || '',
                                docs_url: p.docs_url || '',
                                video_url: p.video_url || '',
                                figma_url: p.figma_url || '',
                                download_url: p.download_url || '',
                                timeline: p.timeline || '',
                                category: p.category || 'Software Projects',
                                tags: p.tags?.join(', ') || '',
                                team_members: p.team_members?.join(', ') || '',
                                screenshots: p.screenshots?.join('\n') || '',
                                is_featured: p.is_featured,
                                published: p.published,
                                archived: p.archived,
                                priority_pin: p.priority_pin,
                                sort_order: p.sort_order || 0
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button className="nav-btn" onClick={() => handleDeleteItem(p.id, 'project')}>
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Timeline CRUD */}
        {activeTab === 'timeline' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Manage Timeline Events</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setModalType('timeline');
                  setEditingId(null);
                  setTimelineForm({
                    title_en: '',
                    organization_en: '',
                    category: 'Education',
                    start_date: '',
                    end_date: '',
                    description_en: '',
                    featured: false,
                    sort_order: timeline.length + 1
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                <span>New Timeline Item</span>
              </button>
            </div>

            <div className="glass-panel cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Org</th>
                    <th>Category</th>
                    <th>Start Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700 }}>{t.title_en}</td>
                      <td>{t.organization_en}</td>
                      <td>{t.category}</td>
                      <td>{t.start_date.substring(0, 7)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="nav-btn"
                            onClick={() => {
                              setModalType('timeline');
                              setEditingId(t.id);
                              setTimelineForm({
                                title_en: t.title_en,
                                organization_en: t.organization_en,
                                category: t.category,
                                start_date: t.start_date,
                                end_date: t.end_date || '',
                                description_en: t.description_en.join('\n'),
                                featured: t.featured,
                                sort_order: t.sort_order || 0
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button className="nav-btn" onClick={() => handleDeleteItem(t.id, 'timeline')}>
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Skills CRUD */}
        {activeTab === 'skills' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Manage Technical Skills</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setModalType('skill');
                  setEditingId(null);
                  setSkillForm({
                    name: '',
                    category: 'Programming',
                    proficiency: 80,
                    sort_order: skills.length + 1
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                <span>New Skill</span>
              </button>
            </div>

            <div className="glass-panel cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Skill Name</th>
                    <th>Category</th>
                    <th>Proficiency</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700 }}>{s.name}</td>
                      <td>{s.category}</td>
                      <td>{s.proficiency}%</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="nav-btn"
                            onClick={() => {
                              setModalType('skill');
                              setEditingId(s.id);
                              setSkillForm({
                                name: s.name,
                                category: s.category,
                                proficiency: s.proficiency,
                                sort_order: s.sort_order || 0
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button className="nav-btn" onClick={() => handleDeleteItem(s.id, 'skill')}>
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Certifications CRUD */}
        {activeTab === 'certs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Manage Achievements & Certifications</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setModalType('cert');
                  setEditingId(null);
                  setCertForm({
                    title_en: '',
                    slug: '',
                    issuer: '',
                    date_earned: '',
                    credential_url: '',
                    file_url: '',
                    category: 'Certificate',
                    importance: 'medium',
                    feature_homepage: true,
                    archived: false,
                    sort_order: certs.length + 1
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                <span>New Cert / Award</span>
              </button>
            </div>

            <div className="glass-panel cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Issuer</th>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {certs.map(c => (
                    <tr key={c.id} style={{ opacity: c.archived ? 0.5 : 1 }}>
                      <td style={{ fontWeight: 700 }}>{c.title_en}</td>
                      <td>{c.issuer}</td>
                      <td>{c.date_earned}</td>
                      <td>{c.category}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="nav-btn"
                            onClick={() => {
                              setModalType('cert');
                              setEditingId(c.id);
                              setCertForm({
                                title_en: c.title_en,
                                slug: c.slug || '',
                                issuer: c.issuer,
                                date_earned: c.date_earned,
                                credential_url: c.credential_url || '',
                                file_url: c.file_url || '',
                                category: c.category,
                                importance: c.importance,
                                feature_homepage: c.feature_homepage,
                                archived: c.archived || false,
                                sort_order: c.sort_order || 0
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button className="nav-btn" onClick={() => handleDeleteItem(c.id, 'cert')}>
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5.5: Blogs CRUD */}
        {activeTab === 'blogs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Manage Blogs & Technical Articles</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setModalType('blog');
                  setEditingId(null);
                  setBlogForm({
                    title_en: '',
                    slug: '',
                    content_en: '',
                    category: 'Engineering',
                    reading_time: '5 min read',
                    cover_image: '',
                    tags: '',
                    published: true,
                    archived: false,
                    sort_order: blogs.length + 1
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                <span>New Blog Post</span>
              </button>
            </div>

            <div className="glass-panel cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Reading Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map(b => (
                    <tr key={b.id} style={{ opacity: b.archived ? 0.5 : 1 }}>
                      <td style={{ fontWeight: 700 }}>{b.title_en}</td>
                      <td>{b.category}</td>
                      <td>{b.reading_time}</td>
                      <td>
                        <span className={`badge-status ${b.archived ? 'draft' : b.published ? 'published' : 'draft'}`}>
                          {b.archived ? 'Archived' : b.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="nav-btn"
                            onClick={() => {
                              setModalType('blog');
                              setEditingId(b.id);
                              setBlogForm({
                                title_en: b.title_en,
                                slug: b.slug,
                                content_en: b.content_en,
                                category: b.category,
                                reading_time: b.reading_time || '5 min read',
                                cover_image: b.cover_image || '',
                                tags: b.tags?.join(', ') || '',
                                published: b.published,
                                archived: b.archived || false,
                                sort_order: b.sort_order || 0
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button className="nav-btn" onClick={() => handleDeleteItem(b.id, 'blog')}>
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5.6: Testimonials CRUD */}
        {activeTab === 'testimonials' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Manage Recommendations</h2>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setModalType('testimonial');
                  setEditingId(null);
                  setTestimonialForm({
                    author_name: '',
                    author_title_en: '',
                    author_company: '',
                    avatar_url: '',
                    content_en: '',
                    rating: 5,
                    published: true
                  });
                  setShowModal(true);
                }}
              >
                <Plus size={16} />
                <span>New Recommendation</span>
              </button>
            </div>

            <div className="glass-panel cms-table-wrapper">
              <table className="cms-table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Title & Company</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 700 }}>{t.author_name}</td>
                      <td>{t.author_title_en} {t.author_company ? `(${t.author_company})` : ''}</td>
                      <td>{t.rating} ★</td>
                      <td>
                        <span className={`badge-status ${t.published ? 'published' : 'draft'}`}>
                          {t.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="nav-btn"
                            onClick={() => {
                              setModalType('testimonial');
                              setEditingId(t.id);
                              setTestimonialForm({
                                author_name: t.author_name,
                                author_title_en: t.author_title_en,
                                author_company: t.author_company || '',
                                avatar_url: t.avatar_url || '',
                                content_en: t.content_en,
                                rating: t.rating,
                                published: t.published
                              });
                              setShowModal(true);
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          <button className="nav-btn" onClick={() => handleDeleteItem(t.id, 'testimonial')}>
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Media Manager */}
        {activeTab === 'media' && (
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px' }}>
            <MediaManager />
          </div>
        )}

        {/* Tab 7: Messages Inbox */}
        {activeTab === 'inbox' && (
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '20px' }}>Contact Inbox Manager</h2>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }} className="glass-panel">
                No message submissions yet.
              </div>
            ) : (
              <div className="inbox-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {messages.map(msg => (
                  <div key={msg.id} className="glass-card message-card" style={{ margin: 0, padding: '20px', borderLeft: msg.status === 'unread' ? '4px solid hsl(var(--accent-primary))' : '1px solid var(--border-glass)' }}>
                    <div className="message-card-header" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <span className="message-sender" style={{ fontWeight: 700 }}>{msg.sender_name}</span>
                        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginLeft: '10px' }}>
                          &lt;{msg.sender_email}&gt;
                        </span>
                      </div>
                      
                      <div className="message-meta" style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                        <span>{msg.device || 'Desktop'}</span> &bull; <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <h4 style={{ fontWeight: 700, margin: '8px 0 4px' }}>Subject: {msg.subject || 'Collaboration Query'}</h4>
                    <p className="message-body" style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                      {msg.message_text}
                    </p>

                    {/* Replies conversation history */}
                    {msg.replies && msg.replies.length > 0 && (
                      <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px dashed var(--border-glass)' }}>
                        <h5 style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: 'hsl(var(--accent-primary))' }}>Reply Correspondence History:</h5>
                        {msg.replies.map((rep, rIdx) => (
                          <div key={rIdx} style={{ fontSize: '0.85rem', marginBottom: '6px', borderBottom: rIdx < msg.replies.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>
                              <span>Addisu (Admin)</span>
                              <span>{new Date(rep.sent_at).toLocaleDateString()}</span>
                            </div>
                            <p style={{ marginTop: '2px', color: 'hsl(var(--text-secondary))' }}>{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="message-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px', alignItems: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          setReplyMessageId(msg.id);
                          setReplySubject(`Re: ${msg.subject || 'Portfolio Collaboration'}`);
                          setReplyText(`Hi ${msg.sender_name},\n\nThank you for reaching out! I appreciate your message regarding "${msg.subject || 'collaboration'}".\n\n[Write details here]\n\nBest regards,\nAddisu Yirdaw Deresse`);
                        }}
                      >
                        Reply Email
                      </button>

                      {msg.status === 'unread' ? (
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleMessageStatus(msg.id, 'read')}>
                          Mark Read
                        </button>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleMessageStatus(msg.id, 'unread')}>
                          Mark Unread
                        </button>
                      )}

                      <button className="nav-btn" onClick={() => handleMessageDelete(msg.id)}>
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>

                    {/* Quick reply inline composer */}
                    {replyMessageId === msg.id && (
                      <form onSubmit={handleSendReply} style={{ marginTop: '15px', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
                        <div className="form-group">
                          <label className="form-label">Subject</label>
                          <input type="text" className="form-input" value={replySubject} onChange={e => setReplySubject(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email Body Reply</label>
                          <textarea className="form-textarea" rows={6} value={replyText} onChange={e => setReplyText(e.target.value)} required />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} disabled={replying}>
                            <Send size={14} />
                            <span>{replying ? 'Sending...' : 'Send Reply Email'}</span>
                          </button>
                          <button type="button" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }} onClick={() => setReplyMessageId(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Profile & System Settings */}
        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {/* System settings form */}
            <form className="glass-panel" onSubmit={handleSaveProfile} style={{ padding: '30px', borderRadius: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Career Management Profile Settings</h2>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Headline</label>
                <input type="text" className="form-input" value={profileForm.headline} onChange={e => setProfileForm({...profileForm, headline: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Contact</label>
                <input type="text" className="form-input" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-input" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} />
              </div>

              <h4 style={{ fontWeight: 700, margin: '20px 0 10px', color: 'hsl(var(--accent-primary))' }}>Social Links</h4>
              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input type="url" className="form-input" value={profileForm.github_url} onChange={e => setProfileForm({...profileForm, github_url: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input type="url" className="form-input" value={profileForm.linkedin_url} onChange={e => setProfileForm({...profileForm, linkedin_url: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube URL</label>
                <input type="url" className="form-input" value={profileForm.youtube_url} onChange={e => setProfileForm({...profileForm, youtube_url: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Twitter / X URL</label>
                <input type="url" className="form-input" value={profileForm.twitter_url} onChange={e => setProfileForm({...profileForm, twitter_url: e.target.value})} />
              </div>

              <h4 style={{ fontWeight: 700, margin: '20px 0 10px', color: 'hsl(var(--accent-primary))' }}>SEO Metadata Config</h4>
              <div className="form-group">
                <label className="form-label">SEO Page Title</label>
                <input type="text" className="form-input" value={profileForm.seo_title} onChange={e => setProfileForm({...profileForm, seo_title: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">SEO Description Meta</label>
                <textarea className="form-textarea" value={profileForm.seo_description} onChange={e => setProfileForm({...profileForm, seo_description: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">SEO Keywords Meta</label>
                <input type="text" className="form-input" value={profileForm.seo_keywords} onChange={e => setProfileForm({...profileForm, seo_keywords: e.target.value})} />
              </div>

              <h4 style={{ fontWeight: 700, margin: '20px 0 10px', color: 'hsl(var(--accent-primary))' }}>Email System Integration (EmailJS / Resend)</h4>
              <div className="form-group">
                <label className="form-label">Provider Select</label>
                <select className="form-select" value={profileForm.email_provider} onChange={e => setProfileForm({...profileForm, email_provider: e.target.value})}>
                  <option value="resend">Resend (Serverless SMTP API)</option>
                  <option value="emailjs">EmailJS (Client-Side REST)</option>
                </select>
              </div>
              
              {profileForm.email_provider === 'resend' ? (
                <div className="form-group">
                  <label className="form-label">Resend API Key</label>
                  <input type="password" placeholder="re_xxxxxxxxxxxx" className="form-input" value={profileForm.email_apiKey} onChange={e => setProfileForm({...profileForm, email_apiKey: e.target.value})} />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">EmailJS Service ID</label>
                    <input type="text" className="form-input" value={profileForm.email_serviceId} onChange={e => setProfileForm({...profileForm, email_serviceId: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">EmailJS Template ID</label>
                    <input type="text" className="form-input" value={profileForm.email_templateId} onChange={e => setProfileForm({...profileForm, email_templateId: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">EmailJS Public Key</label>
                    <input type="text" className="form-input" value={profileForm.email_publicKey} onChange={e => setProfileForm({...profileForm, email_publicKey: e.target.value})} />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Forward Contact Alerts To</label>
                <input type="email" placeholder="addisulal@gmail.com" className="form-input" value={profileForm.email_toEmail} onChange={e => setProfileForm({...profileForm, email_toEmail: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
                <Save size={16} />
                <span>Save Profile System Settings</span>
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignSelf: 'flex-start' }}>
              {/* Backups panel */}
              <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '15px' }}>Platform Storage Sync & Backups</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', marginBottom: '20px' }}>
                  Export all content from this Career Management Platform to a JSON file, or restore data using a previously exported backup file.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <button className="btn btn-primary" onClick={exportDatabase}>
                    <Database size={16} />
                    <span>Export JSON Backup</span>
                  </button>

                  <label className="btn btn-secondary" style={{ textAlign: 'center', cursor: 'pointer', padding: '0.6rem' }}>
                    <Upload size={16} style={{ marginRight: '6px' }} />
                    <span>Import JSON Backup</span>
                    <input type="file" accept=".json" onChange={importDatabase} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Account Security panel */}
              <form className="glass-panel" onSubmit={handleUpdateSecurity} style={{ padding: '30px', borderRadius: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '15px' }}>Account Security Settings</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', marginBottom: '20px' }}>
                  Update your CMS administrator authentication credentials. Changes will require you to log in again.
                </p>

                {securityError && (
                  <div style={{ padding: '10px', background: 'rgba(225,29,72,0.1)', border: '1px solid #e11d48', borderRadius: '8px', color: '#e11d48', marginBottom: '15px', fontSize: '0.85rem' }}>
                    {securityError}
                  </div>
                )}
                {securitySuccess && (
                  <div style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', marginBottom: '15px', fontSize: '0.85rem' }}>
                    {securitySuccess}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">New Email Address / Username</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="new-email@example.com"
                    value={securityEmail}
                    onChange={e => setSecurityEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={securityPassword}
                    onChange={e => setSecurityPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={securityConfirmPassword}
                    onChange={e => setSecurityConfirmPassword(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '15px' }}>
                  <Save size={16} />
                  <span>Update Account Credentials</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* CRUD Overlay Form Modal Dialog */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div className="glass-panel" style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '30px',
            borderRadius: '24px',
            position: 'relative',
            border: '1px solid var(--border-glass)'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--text-secondary))' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', textTransform: 'capitalize' }}>
              {editingId ? 'Edit record' : 'Create new entry'} ({modalType})
            </h3>

            <form onSubmit={handleSave}>
              {/* Project Form Fields */}
              {modalType === 'project' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={projectForm.title} 
                      onChange={e => {
                        const val = e.target.value;
                        setProjectForm({...projectForm, title: val, slug: generateSlug(val)});
                      }} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slug (Auto-generated)</label>
                    <input type="text" className="form-input" value={projectForm.slug} onChange={e => setProjectForm({...projectForm, slug: generateSlug(e.target.value)})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Subtitle</label>
                    <input type="text" className="form-input" value={projectForm.subtitle} onChange={e => setProjectForm({...projectForm, subtitle: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input type="text" list="proj-cats" className="form-input" value={projectForm.category} onChange={e => setProjectForm({...projectForm, category: e.target.value})} />
                    <datalist id="proj-cats">
                      <option value="Software Projects" />
                      <option value="Startup Ventures" />
                      <option value="AI Products" />
                      <option value="Mobile Applications" />
                      <option value="Research Papers" />
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description (English)</label>
                    <textarea className="form-textarea" rows={4} value={projectForm.description_en} onChange={e => setProjectForm({...projectForm, description_en: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">The Problem Solved</label>
                    <textarea className="form-textarea" rows={3} value={projectForm.problem_en} onChange={e => setProjectForm({...projectForm, problem_en: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">The Solution Offered</label>
                    <textarea className="form-textarea" rows={3} value={projectForm.solution_en} onChange={e => setProjectForm({...projectForm, solution_en: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">System Architecture</label>
                    <textarea className="form-textarea" rows={3} value={projectForm.architecture_en} onChange={e => setProjectForm({...projectForm, architecture_en: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Core Features (New Line Separated)</label>
                    <textarea className="form-textarea" rows={3} placeholder="Feature 1&#10;Feature 2" value={projectForm.features} onChange={e => setProjectForm({...projectForm, features: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roadmap (Format: Milestone | Stage | Date - New Line Separated)</label>
                    <textarea className="form-textarea" rows={3} placeholder="Offline recognition | Beta | 2026-08-01" value={projectForm.roadmap} onChange={e => setProjectForm({...projectForm, roadmap: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Technologies (Comma Separated)</label>
                    <input type="text" className="form-input" value={projectForm.technologies} onChange={e => setProjectForm({...projectForm, technologies: e.target.value})} required />
                  </div>
                  
                  <h4 style={{ fontWeight: 700, margin: '15px 0 10px', fontSize: '0.9rem', color: 'hsl(var(--accent-primary))' }}>Deployment & Resource Links</h4>
                  <div className="form-group">
                    <label className="form-label">Live Demo Showcase URL</label>
                    <input type="url" className="form-input" value={projectForm.demo_url} onChange={e => setProjectForm({...projectForm, demo_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GitHub Repository URL</label>
                    <input type="url" className="form-input" value={projectForm.github_url} onChange={e => setProjectForm({...projectForm, github_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Documentation URL</label>
                    <input type="url" className="form-input" value={projectForm.docs_url} onChange={e => setProjectForm({...projectForm, docs_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Video Demo URL</label>
                    <input type="url" className="form-input" value={projectForm.video_url} onChange={e => setProjectForm({...projectForm, video_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Figma Design URL</label>
                    <input type="url" className="form-input" value={projectForm.figma_url} onChange={e => setProjectForm({...projectForm, figma_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Download Files Link</label>
                    <input type="url" className="form-input" value={projectForm.download_url} onChange={e => setProjectForm({...projectForm, download_url: e.target.value})} />
                  </div>
                  
                  <h4 style={{ fontWeight: 700, margin: '15px 0 10px', fontSize: '0.9rem', color: 'hsl(var(--accent-primary))' }}>Metadata Properties</h4>
                  <div className="form-group">
                    <label className="form-label">Timeline (e.g. Jan 2026 - Present)</label>
                    <input type="text" className="form-input" value={projectForm.timeline} onChange={e => setProjectForm({...projectForm, timeline: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (Comma Separated)</label>
                    <input type="text" className="form-input" value={projectForm.tags} onChange={e => setProjectForm({...projectForm, tags: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Team Members (Comma Separated)</label>
                    <input type="text" className="form-input" value={projectForm.team_members} onChange={e => setProjectForm({...projectForm, team_members: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Screenshots Gallery (New Line Separated URL Paths)</label>
                    <textarea className="form-textarea" rows={2} value={projectForm.screenshots} onChange={e => setProjectForm({...projectForm, screenshots: e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Sort Order (Rank Order Number)</label>
                    <input type="number" className="form-input" value={projectForm.sort_order} onChange={e => setProjectForm({...projectForm, sort_order: parseInt(e.target.value) || 0})} />
                  </div>

                  <div className="form-group" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={projectForm.is_featured} onChange={e => setProjectForm({...projectForm, is_featured: e.target.checked})} />
                      Featured homepage
                    </label>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={projectForm.priority_pin} onChange={e => setProjectForm({...projectForm, priority_pin: e.target.checked})} />
                      Pin to Top
                    </label>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={projectForm.published} onChange={e => setProjectForm({...projectForm, published: e.target.checked})} />
                      Published
                    </label>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={projectForm.archived} onChange={e => setProjectForm({...projectForm, archived: e.target.checked})} />
                      Archived
                    </label>
                  </div>
                </>
              )}

              {/* Skill Form Fields */}
              {modalType === 'skill' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Skill Name</label>
                    <input type="text" className="form-input" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input type="text" list="skill-cats" className="form-input" value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} />
                    <datalist id="skill-cats">
                      <option value="Programming" />
                      <option value="Development" />
                      <option value="AI" />
                      <option value="Business" />
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Proficiency Level (0-100)</label>
                    <input type="number" min="0" max="100" className="form-input" value={skillForm.proficiency} onChange={e => setSkillForm({...skillForm, proficiency: parseInt(e.target.value) || 80})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={skillForm.sort_order} onChange={e => setSkillForm({...skillForm, sort_order: parseInt(e.target.value) || 0})} />
                  </div>
                </>
              )}

              {/* Timeline Form Fields */}
              {modalType === 'timeline' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Event/Role Title</label>
                    <input type="text" className="form-input" value={timelineForm.title_en} onChange={e => setTimelineForm({...timelineForm, title_en: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organization Name</label>
                    <input type="text" className="form-input" value={timelineForm.organization_en} onChange={e => setTimelineForm({...timelineForm, organization_en: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input type="text" list="time-cats" className="form-input" value={timelineForm.category} onChange={e => setTimelineForm({...timelineForm, category: e.target.value})} />
                    <datalist id="time-cats">
                      <option value="Education" />
                      <option value="Leadership" />
                      <option value="Projects" />
                      <option value="Hackathons" />
                      <option value="Volunteer" />
                      <option value="Experience" />
                      <option value="Award" />
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input" value={timelineForm.start_date} onChange={e => setTimelineForm({...timelineForm, start_date: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date (Leave blank for Present)</label>
                    <input type="date" className="form-input" value={timelineForm.end_date} onChange={e => setTimelineForm({...timelineForm, end_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description Bullets (New Line Separated)</label>
                    <textarea className="form-textarea" rows={4} value={timelineForm.description_en} onChange={e => setTimelineForm({...timelineForm, description_en: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={timelineForm.sort_order} onChange={e => setTimelineForm({...timelineForm, sort_order: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={timelineForm.featured} onChange={e => setTimelineForm({...timelineForm, featured: e.target.checked})} />
                      Featured timeline block
                    </label>
                  </div>
                </>
              )}

              {/* Certifications Form Fields */}
              {modalType === 'cert' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Certificate Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={certForm.title_en} 
                      onChange={e => {
                        const val = e.target.value;
                        setCertForm({...certForm, title_en: val, slug: generateSlug(val)});
                      }} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slug (Auto-generated)</label>
                    <input type="text" className="form-input" value={certForm.slug} onChange={e => setCertForm({...certForm, slug: generateSlug(e.target.value)})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Issuer</label>
                    <input type="text" className="form-input" value={certForm.issuer} onChange={e => setCertForm({...certForm, issuer: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Earned</label>
                    <input type="date" className="form-input" value={certForm.date_earned} onChange={e => setCertForm({...certForm, date_earned: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Credential Verification Link</label>
                    <input type="url" className="form-input" value={certForm.credential_url} onChange={e => setCertForm({...certForm, credential_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Certificate PDF/Image File Path (uploaded from Media Manager)</label>
                    <input type="text" placeholder="Certificates/certificate_name_12345.pdf" className="form-input" value={certForm.file_url} onChange={e => setCertForm({...certForm, file_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input type="text" list="cert-cats" className="form-input" value={certForm.category} onChange={e => setCertForm({...certForm, category: e.target.value})} />
                    <datalist id="cert-cats">
                      <option value="Certificate" />
                      <option value="Award" />
                      <option value="Badge" />
                      <option value="Fellowship" />
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Importance</label>
                    <select className="form-select" value={certForm.importance} onChange={e => setCertForm({...certForm, importance: e.target.value as any})}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={certForm.sort_order} onChange={e => setCertForm({...certForm, sort_order: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={certForm.feature_homepage} onChange={e => setCertForm({...certForm, feature_homepage: e.target.checked})} />
                      Show on Home
                    </label>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={certForm.archived} onChange={e => setCertForm({...certForm, archived: e.target.checked})} />
                      Archived
                    </label>
                  </div>
                </>
              )}

              {/* Blogs Form Fields */}
              {modalType === 'blog' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Article Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={blogForm.title_en} 
                      onChange={e => {
                        const val = e.target.value;
                        setBlogForm({...blogForm, title_en: val, slug: generateSlug(val)});
                      }} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Slug (Auto-generated)</label>
                    <input type="text" className="form-input" value={blogForm.slug} onChange={e => setBlogForm({...blogForm, slug: generateSlug(e.target.value)})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Reading Time (e.g. 5 min read)</label>
                    <input type="text" className="form-input" value={blogForm.reading_time} onChange={e => setBlogForm({...blogForm, reading_time: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input type="text" list="blog-cats" className="form-input" value={blogForm.category} onChange={e => setBlogForm({...blogForm, category: e.target.value})} />
                    <datalist id="blog-cats">
                      <option value="Engineering" />
                      <option value="Accessibility" />
                      <option value="AI & Productivity" />
                      <option value="Workshops" />
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cover Image Path (from Media Manager)</label>
                    <input type="text" className="form-input" value={blogForm.cover_image} onChange={e => setBlogForm({...blogForm, cover_image: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Content (Markdown Format)</label>
                    <textarea className="form-textarea" rows={10} value={blogForm.content_en} onChange={e => setBlogForm({...blogForm, content_en: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (Comma Separated)</label>
                    <input type="text" className="form-input" value={blogForm.tags} onChange={e => setBlogForm({...blogForm, tags: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-input" value={blogForm.sort_order} onChange={e => setBlogForm({...blogForm, sort_order: parseInt(e.target.value) || 0})} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={blogForm.published} onChange={e => setBlogForm({...blogForm, published: e.target.checked})} />
                      Published
                    </label>
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={blogForm.archived} onChange={e => setBlogForm({...blogForm, archived: e.target.checked})} />
                      Archived
                    </label>
                  </div>
                </>
              )}

              {/* Testimonials Form Fields */}
              {modalType === 'testimonial' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Author Name</label>
                    <input type="text" className="form-input" value={testimonialForm.author_name} onChange={e => setTestimonialForm({...testimonialForm, author_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author Title (English)</label>
                    <input type="text" className="form-input" value={testimonialForm.author_title_en} onChange={e => setTestimonialForm({...testimonialForm, author_title_en: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author Company</label>
                    <input type="text" className="form-input" value={testimonialForm.author_company} onChange={e => setTestimonialForm({...testimonialForm, author_company: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Avatar URL Path</label>
                    <input type="text" className="form-input" value={testimonialForm.avatar_url} onChange={e => setTestimonialForm({...testimonialForm, avatar_url: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recommendation Text (English)</label>
                    <textarea className="form-textarea" rows={4} value={testimonialForm.content_en} onChange={e => setTestimonialForm({...testimonialForm, content_en: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Rating Rating (1-5)</label>
                    <input type="number" min="1" max="5" className="form-input" value={testimonialForm.rating} onChange={e => setTestimonialForm({...testimonialForm, rating: parseInt(e.target.value) || 5})} required />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', gap: '6px', fontSize: '0.85rem' }}>
                      <input type="checkbox" checked={testimonialForm.published} onChange={e => setTestimonialForm({...testimonialForm, published: e.target.checked})} />
                      Published
                    </label>
                  </div>
                </>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                <Save size={16} />
                <span>Save Record</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
