import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  projectRepository, 
  skillRepository, 
  timelineRepository, 
  achievementRepository, 
  testimonialRepository, 
  blogRepository, 
  messageRepository,
  profileRepository
} from '../../infrastructure/gateways';
import { EmailService } from '../../domain/services/EmailService';
import type { Project, Skill, TimelineEvent, Achievement, Testimonial, Blog } from '../../domain/entities';
import { InputSanitizer } from '../../domain/services';
import { Hero } from '../components/Hero';
import { TimelineView } from '../components/TimelineView';
import { Shield, Award, Sparkles, Send, ExternalLink, Calendar, Search } from 'lucide-react';

interface HomeProps {
  onSelectProject: (slug: string) => void;
  onOpenResumeBuilder: () => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectProject, onOpenResumeBuilder }) => {
  const { language, t } = useLanguage();
  
  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Contact Form States
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Stats Counters
  const [stats, setStats] = useState({ projects: 0, certificates: 0, hours: 120, impacted: 1000 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projs, sks, times, certs, tests, posts] = await Promise.all([
          projectRepository.getAll(false),
          skillRepository.getAll(),
          timelineRepository.getAll(),
          achievementRepository.getAll(),
          testimonialRepository.getAll(false),
          blogRepository.getAll(false)
        ]);

        setProjects(projs);
        setSkills(sks);
        setTimeline(times);
        setAchievements(certs);
        setTestimonials(tests);
        setBlogs(posts);

        setStats({
          projects: projs.length,
          certificates: certs.length,
          hours: 140, // Volunteer hours
          impacted: 1500 // Users Impacted
        });
      } catch (err) {
        console.error('Failed to load portfolio items:', err);
      }
    };
    loadData();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = InputSanitizer.validateContactForm(senderName, senderEmail, messageText);
    if (Object.keys(validationErrors).length > 0) {
      setFormError(Object.values(validationErrors)[0]);
      return;
    }
    
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const cleanName = InputSanitizer.sanitizeText(senderName).slice(0, 100);
      const cleanEmail = InputSanitizer.sanitizeEmail(senderEmail).value;
      const cleanSubject = InputSanitizer.sanitizeText(subject || 'General Collaboration Query').slice(0, 200);
      const cleanMessage = InputSanitizer.sanitizeText(messageText).slice(0, 3000);
      const cleanDevice = window.innerWidth < 768 ? 'Mobile Client' : 'Desktop Client';

      const payload = {
        sender_name: cleanName,
        sender_email: cleanEmail,
        subject: cleanSubject,
        message_text: cleanMessage,
        country: 'Ethiopia' as string,
        device: cleanDevice as string,
      };

      await messageRepository.create(payload);
      
      // Dispatch asynchronous notification email
      profileRepository.get().then(profile => {
        if (profile) {
          EmailService.sendNotification(profile, payload);
        }
      }).catch(err => console.error('Failed to load profile for notification:', err));

      setFormSuccess(true);
      setSenderName('');
      setSenderEmail('');
      setSubject('');
      setMessageText('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to deliver message.');
    } finally {
      setFormLoading(false);
    }
  };

  // Group skills by category
  const categories = ['Programming', 'Development', 'AI', 'Business'] as const;

  // Filter datasets based on global search
  const filteredProjects = projects.filter(proj => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      proj.title.toLowerCase().includes(q) ||
      (proj.subtitle && proj.subtitle.toLowerCase().includes(q)) ||
      proj.description_en.toLowerCase().includes(q) ||
      (proj.description_am && proj.description_am.toLowerCase().includes(q)) ||
      (proj.problem_en && proj.problem_en.toLowerCase().includes(q)) ||
      (proj.solution_en && proj.solution_en.toLowerCase().includes(q)) ||
      proj.technologies.some(t => t.toLowerCase().includes(q)) ||
      (proj.category && proj.category.toLowerCase().includes(q))
    );
  });

  const filteredSkills = skills.filter(skill => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return skill.name.toLowerCase().includes(q) || skill.category.toLowerCase().includes(q);
  });

  const filteredTimeline = timeline.filter(event => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      event.title_en.toLowerCase().includes(q) ||
      (event.title_am && event.title_am.toLowerCase().includes(q)) ||
      event.organization_en.toLowerCase().includes(q) ||
      event.category.toLowerCase().includes(q) ||
      event.description_en.some(d => d.toLowerCase().includes(q))
    );
  });

  const filteredAchievements = achievements.filter(cert => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      cert.title_en.toLowerCase().includes(q) ||
      cert.issuer.toLowerCase().includes(q) ||
      cert.category.toLowerCase().includes(q)
    );
  });

  const filteredTestimonials = testimonials.filter(test => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      test.author_name.toLowerCase().includes(q) ||
      test.author_title_en.toLowerCase().includes(q) ||
      (test.author_company && test.author_company.toLowerCase().includes(q)) ||
      test.content_en.toLowerCase().includes(q)
    );
  });

  const filteredBlogs = blogs.filter(post => {
    if (!globalSearchQuery) return true;
    const q = globalSearchQuery.toLowerCase();
    return (
      post.title_en.toLowerCase().includes(q) ||
      post.category.toLowerCase().includes(q) ||
      post.content_en.toLowerCase().includes(q) ||
      post.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div>
      {/* 1. Hero */}
      <Hero 
        onExploreProjects={() => {
          document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onContactClick={() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenResumeBuilder={onOpenResumeBuilder}
        stats={stats}
      />

      {/* Global Realtime Search Bar */}
      <div className="container" style={{ marginTop: '-40px', marginBottom: '20px', position: 'relative', zIndex: 10 }}>
        <div className="glass-panel" style={{ padding: '14px 24px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Search size={20} style={{ color: 'hsl(var(--accent-primary))' }} />
          <input 
            type="text"
            placeholder={t('searchPlaceholder') || 'Global Search (Projects, Skills, Blogs, Achievements...)'}
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '1.05rem',
              outline: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />
          {globalSearchQuery && (
            <button 
              onClick={() => setGlobalSearchQuery('')}
              className="nav-btn"
              style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px' }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 2. About Me */}
      <section className="section-padding container" id="about" style={{ scrollMarginTop: '70px' }}>
        <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '20px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', width: 'fit-content' }}>
            {t('aboutTitle')}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            <div>
              <p style={{ fontSize: '1.1rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.7', marginBottom: '15px' }}>
                {t('aboutStory')}
              </p>
              <p style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.7' }}>
                Currently pursuing a **BSc in Computer Science** alongside a degree in **Business Administration** in Ethiopia. By bridging these domains, I strive to design applications that resolve accessibility bottlenecks (like visually impaired textbook access) and data management risks (like healthcare tracking platforms) while remaining economically scalable.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="glass-card" style={{ margin: 0, padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Shield size={24} style={{ color: 'hsl(var(--accent-primary))' }} />
                <div>
                  <h4 style={{ fontWeight: 700 }}>Security & Zero-Trust</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Integrating robust authentication, OAuth2, and RLS.</p>
                </div>
              </div>
              
              <div className="glass-card" style={{ margin: 0, padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Sparkles size={24} style={{ color: 'hsl(var(--accent-primary))' }} />
                <div>
                  <h4 style={{ fontWeight: 700 }}>Accessibility (WCAG 2.2)</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Design frameworks optimizing voice commands and high contrast.</p>
                </div>
              </div>

              <div className="glass-card" style={{ margin: 0, padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                <Award size={24} style={{ color: 'hsl(var(--accent-primary))' }} />
                <div>
                  <h4 style={{ fontWeight: 700 }}>AI Integrations</h4>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Building local NLP matching systems and secure Gemini hooks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Skills */}
      {filteredSkills.length > 0 && (
        <section className="section-padding container" id="skills" style={{ scrollMarginTop: '70px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
            {t('skillsTitle')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            {categories.map(cat => {
              const catSkills = filteredSkills.filter(s => s.category === cat);
              if (catSkills.length === 0) return null;
              return (
                <div key={cat} className="glass-card" style={{ margin: 0 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', marginBottom: '15px', color: 'hsl(var(--accent-primary))' }}>
                    {cat}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {catSkills.map(skill => (
                      <div key={skill.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                          <span>{skill.name}</span>
                          <span>{skill.proficiency}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--border-glass)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${skill.proficiency}%`, background: 'var(--accent-gradient)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Projects */}
      {filteredProjects.length > 0 && (
        <section className="section-padding container" id="projects" style={{ scrollMarginTop: '70px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
            {t('projectsTitle')}
          </h2>

          <div className="project-grid">
            {filteredProjects.map(proj => {
              const title = proj.title;
              const desc = language === 'am' && proj.description_am ? proj.description_am : proj.description_en;
              
              return (
                <div key={proj.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-glow)', color: 'hsl(var(--accent-primary))' }}>
                        {proj.is_featured ? 'Featured' : proj.category || 'Project'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} />
                        {new Date(proj.created_at).getFullYear()}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>{title}</h3>
                    {proj.subtitle && <p style={{ fontSize: '0.85rem', color: 'hsl(var(--accent-primary))', fontWeight: 600, marginTop: '-5px', marginBottom: '10px' }}>{proj.subtitle}</p>}
                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', marginBottom: '15px' }}>
                      {desc}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '15px' }}>
                      {proj.technologies.slice(0, 4).map(tech => (
                        <span key={tech} style={{ fontSize: '0.7rem', background: 'var(--border-glass)', padding: '2px 6px', borderRadius: '4px' }}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => onSelectProject(proj.slug)}
                      >
                        <span>Explore Case Study</span>
                      </button>
                      {proj.demo_url ? (
                        <a 
                          href={proj.demo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="nav-btn"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Open Live Demo"
                        >
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Coming Soon</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Career Timeline */}
      {filteredTimeline.length > 0 && (
        <section className="section-padding container" id="timeline" style={{ scrollMarginTop: '70px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
            {t('experienceTitle')}
          </h2>
          <TimelineView events={filteredTimeline} />
        </section>
      )}

      {/* 6. Certifications */}
      {filteredAchievements.length > 0 && (
        <section className="section-padding container" id="certifications" style={{ scrollMarginTop: '70px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
            {t('certificationsTitle')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredAchievements.map(cert => (
              <div key={cert.id} className="glass-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', background: 'var(--border-glass)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase', color: 'hsl(var(--accent-primary))', fontWeight: 700 }}>
                    {cert.category}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '8px', marginBottom: '4px' }}>{cert.title_en}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>{cert.issuer} &bull; {cert.date_earned}</p>
                </div>
                
                <button
                  onClick={() => {
                    // Route sync and trigger popstate
                    window.history.pushState(null, '', `/certificate/${cert.slug || cert.id}`);
                    window.dispatchEvent(new Event('popstate'));
                  }}
                  style={{ 
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: '0.8rem', 
                    color: 'hsl(var(--accent-primary))', 
                    fontWeight: 700, 
                    marginTop: '12px', 
                    display: 'block',
                    textAlign: 'left'
                  }}
                >
                  View Certificate Modal &rarr;
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. Testimonials */}
      {filteredTestimonials.length > 0 && (
        <section className="section-padding container" id="testimonials" style={{ scrollMarginTop: '70px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
            What People Say
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredTestimonials.map(testimonial => (
              <div key={testimonial.id} className="glass-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative' }}>
                {/* Quote mark */}
                <span style={{ position: 'absolute', top: '12px', right: '16px', fontSize: '3rem', lineHeight: 1, color: 'var(--accent-glow)', fontFamily: 'Georgia, serif', fontWeight: 700, opacity: 0.6 }}>&ldquo;</span>
                
                {/* Star rating */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} style={{ color: i < testimonial.rating ? '#f59e0b' : 'var(--border-glass)', fontSize: '1rem' }}>★</span>
                  ))}
                </div>

                <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontStyle: 'italic', flex: 1 }}>
                  &ldquo;{testimonial.content_en}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-glass)' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    color: '#fff',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {testimonial.author_name.charAt(0)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{testimonial.author_name}</p>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
                      {testimonial.author_title_en}{testimonial.author_company ? ` · ${testimonial.author_company}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Blog grid */}
      {filteredBlogs.length > 0 && (
        <section className="section-padding container" id="blog" style={{ scrollMarginTop: '70px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px' }}>
            {t('blogTitle')}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredBlogs.map(post => (
              <div key={post.id} className="glass-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>
                    <span>{post.category}</span>
                    <span>{post.reading_time}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{post.title_en}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                    {post.content_en.substring(0, 140)}...
                  </p>
                </div>
                
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', padding: '0.45rem 0.9rem', fontSize: '0.8rem', marginTop: '15px' }}
                  onClick={() => {
                    window.history.pushState(null, '', `/blog/${post.slug}`);
                    window.dispatchEvent(new Event('popstate'));
                  }}
                >
                  Read Article
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. Contact Form */}
      <section className="section-padding container" id="contact" style={{ scrollMarginTop: '70px' }}>
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '30px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, textAlign: 'center', marginBottom: '20px' }}>
            {t('contactTitle')}
          </h2>

          {formSuccess ? (
            <div style={{ padding: '20px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', textAlign: 'center' }}>
              <p style={{ fontWeight: 700 }}>{t('contactSuccess')}</p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit}>
              {formError && (
                <div style={{ padding: '10px', background: 'rgba(225,29,72,0.1)', border: '1px solid #e11d48', borderRadius: '8px', color: '#e11d48', marginBottom: '15px', fontSize: '0.9rem' }}>
                  {formError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t('contactName')} *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={senderName} 
                  onChange={(e) => setSenderName(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('contactEmail')} *</label>
                <input 
                  type="email" 
                  className="form-input" 
                  value={senderEmail} 
                  onChange={(e) => setSenderEmail(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('contactSubject')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('contactMessage')} *</label>
                <textarea 
                  className="form-textarea" 
                  value={messageText} 
                  onChange={(e) => setMessageText(e.target.value)} 
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px' }}
                disabled={formLoading}
              >
                <Send size={16} />
                <span>{formLoading ? 'Sending...' : t('contactSend')}</span>
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};
