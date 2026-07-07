import React, { useState } from 'react';
import type { Project, TimelineEvent, Skill, Achievement } from '../../domain/entities';
import { useLanguage } from '../context/LanguageContext';
import { Printer, ChevronRight, Settings } from 'lucide-react';

interface ResumeBuilderProps {
  skills: Skill[];
  projects: Project[];
  experiences: TimelineEvent[];
  achievements: Achievement[];
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  skills,
  projects,
  experiences,
  achievements
}) => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<'SE' | 'AI' | 'Leadership'>('SE');
  const [accentColor, setAccentColor] = useState<string>('#3b82f6');
  const [showSummary, setShowSummary] = useState(true);

  // Dynamic filtering based on role
  const getFilteredData = () => {
    switch (selectedRole) {
      case 'AI':
        return {
          title: 'AI & Data Developer Resume',
          summary: 'Computer Science and Business Administration double degree student with high technical capabilities in prompt engineering, local text-to-speech models, and offline AI database caching. Dedicated to building smart mobile solutions.',
          skills: skills.filter(s => s.category === 'AI' || s.category === 'Programming'),
          projects: projects.filter(p => p.slug === 'eduaudio' || p.slug === 'myhealthid'),
          experiences: experiences.filter(e => e.category === 'Education' || e.category === 'Projects'),
          certs: achievements.filter(a => a.category === 'Certificate')
        };
      case 'Leadership':
        return {
          title: 'Student Leadership & Business Consultant Resume',
          summary: 'Ambitious Business Administration student, Debre Berhan University Student Union leader, and remote virtual assistant. Specialized in project coordination, digital systems migrations, and pitching tech innovations.',
          skills: skills.filter(s => s.category === 'Business' || s.category === 'AI'),
          projects: projects.filter(p => p.slug === 'club-connect' || p.slug === 'mydorm-care'),
          experiences: experiences.filter(e => e.category === 'Leadership' || e.category === 'Volunteer'),
          certs: achievements.filter(a => a.category === 'Award')
        };
      case 'SE':
      default:
        return {
          title: 'Software Engineer Resume',
          summary: 'Passionate Computer Science student and mobile application developer. Experienced in designing secure zero-trust APIs, responsive web architectures, and accessibility-first user interfaces using React Native and Expo.',
          skills: skills.filter(s => s.category === 'Programming' || s.category === 'Development'),
          projects: projects.filter(p => p.is_featured),
          experiences: experiences.filter(e => e.category === 'Education' || e.category === 'Volunteer' || e.category === 'Leadership'),
          certs: achievements
        };
    }
  };

  const resumeData = getFilteredData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px', alignItems: 'start' }}>
      
      {/* Configuration Sidebar Panel */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={18} style={{ color: 'hsl(var(--accent-primary))' }} />
          Builder Configs
        </h3>

        {/* Select Specialized Template */}
        <div className="form-group">
          <label className="form-label">{t('resumeSelectRole')}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(['SE', 'AI', 'Leadership'] as const).map(role => (
              <button
                key={role}
                className={`filter-chip ${selectedRole === role ? 'active' : ''}`}
                style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => setSelectedRole(role)}
              >
                <span>
                  {role === 'SE' ? 'Software Engineer' : role === 'AI' ? 'AI Developer' : 'Leadership & Business'}
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Accent Selector */}
        <div className="form-group">
          <label className="form-label">Accent Color Theme</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['#3b82f6', '#10b981', '#8b5cf6', '#e11d48', '#111827'].map(c => (
              <button
                key={c}
                onClick={() => setAccentColor(c)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  border: accentColor === c ? '2px solid hsl(var(--text-primary))' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>

        {/* Toggle Sections */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="checkbox" 
            id="toggleSummary"
            checked={showSummary}
            onChange={(e) => setShowSummary(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <label htmlFor="toggleSummary" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
            Include Bio Summary
          </label>
        </div>

        <button className="btn btn-primary" onClick={handlePrint} style={{ width: '100%' }}>
          <Printer size={16} />
          <span>{t('resumeDownloadPDF')}</span>
        </button>
      </div>

      {/* PDF View Panel (Print Optimized) */}
      <div className="resume-preview-panel" id="resume-print-area">
        {/* CV Header */}
        <div className="resume-header">
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Addisu Yirdaw Deresse
          </h1>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, color: accentColor, margin: '5px 0' }}>
            {resumeData.title}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '4px 0' }}>
            Debre Berhan, Ethiopia &bull; addisulal@gmail.com &bull; github.com/addisuyirdaw &bull; linkedin.com/in/addisuyirdaw2025
          </p>
        </div>

        {/* Executive Summary */}
        {showSummary && (
          <div className="resume-section">
            <h2 className="resume-section-title" style={{ color: accentColor }}>Professional Summary</h2>
            <p style={{ fontSize: '0.85rem', color: '#444' }}>{resumeData.summary}</p>
          </div>
        )}

        {/* Skills */}
        <div className="resume-section">
          <h2 className="resume-section-title" style={{ color: accentColor }}>Core Capabilities</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {resumeData.skills.map(skill => (
              <span 
                key={skill.id} 
                style={{ 
                  fontSize: '0.8rem', 
                  background: '#f3f4f6', 
                  border: '1px solid #e5e7eb', 
                  padding: '3px 8px', 
                  borderRadius: '4px',
                  fontWeight: 500
                }}
              >
                {skill.name} ({skill.proficiency}%)
              </span>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="resume-section">
          <h2 className="resume-section-title" style={{ color: accentColor }}>Key Project Portfolios</h2>
          {resumeData.projects.map(proj => (
            <div key={proj.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>{proj.title}</span>
                <span style={{ color: accentColor, fontSize: '0.8rem' }}>{proj.technologies.slice(0, 4).join(', ')}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#444', marginTop: '2px' }}>
                {proj.description_en}
              </p>
            </div>
          ))}
        </div>

        {/* Experience / Education Timeline */}
        <div className="resume-section">
          <h2 className="resume-section-title" style={{ color: accentColor }}>Education & Leadership History</h2>
          {resumeData.experiences.map(exp => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9rem' }}>
                <span>{exp.title_en}</span>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{exp.start_date.substring(0, 7)} - Present</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#555' }}>{exp.organization_en}</div>
              <ul style={{ paddingLeft: '15px', fontSize: '0.75rem', color: '#444', marginTop: '2px' }}>
                {exp.description_en.map((bullet, i) => (
                  <li key={i}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        {resumeData.certs.length > 0 && (
          <div className="resume-section">
            <h2 className="resume-section-title" style={{ color: accentColor }}>Certifications & Achievements</h2>
            <ul style={{ paddingLeft: '15px', fontSize: '0.8rem', color: '#444' }}>
              {resumeData.certs.map(cert => (
                <li key={cert.id} style={{ marginBottom: '4px' }}>
                  <strong>{cert.title_en}</strong> &bull; {cert.issuer} ({cert.date_earned})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};
