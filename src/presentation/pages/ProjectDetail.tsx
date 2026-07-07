import React, { useState, useEffect } from 'react';
import type { Project } from '../../domain/entities';
import { projectRepository } from '../../infrastructure/gateways';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, ExternalLink, Code, Layers, Check, AlertCircle } from 'lucide-react';

interface ProjectDetailProps {
  slug: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ slug, onBack }) => {
  const { language } = useLanguage();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const item = await projectRepository.getBySlug(slug);
        setProject(item);
        // Increment view count inside database asynchronously
        projectRepository.incrementViews(item.id);
      } catch (err) {
        setError('Case study project not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Loading Case Study Details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <AlertCircle size={48} className="text-red-500" />
        <p style={{ color: 'hsl(var(--text-primary))', fontSize: '1.2rem', fontWeight: 600 }}>{error || 'Project not found.'}</p>
        <button className="btn btn-primary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Return to Home</span>
        </button>
      </div>
    );
  }

  const title = project.title;
  const desc = language === 'am' && project.description_am ? project.description_am : project.description_en;

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      
      {/* Header back navigation */}
      <button 
        className="btn btn-secondary" 
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '20px' }}
        onClick={onBack}
      >
        <ArrowLeft size={14} />
        <span>Back to Portfolio</span>
      </button>

      {/* Case Study Card Panel */}
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Title Block */}
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{title}</h1>
            <p style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600, marginTop: '5px', fontSize: '1.1rem' }}>
              Case Study & Architectural Analysis ({project.views_count} views)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {project.demo_url ? (
              <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={16} />
                <span>Live Showcase</span>
              </a>
            ) : (
              <span className="btn btn-secondary" style={{ opacity: 0.6, cursor: 'not-allowed', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={16} />
                <span>Coming Soon</span>
              </span>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Code size={16} />
                <span>GitHub Code</span>
              </a>
            )}
            {project.docs_url && (
              <a href={project.docs_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} />
                <span>Documentation</span>
              </a>
            )}
            {project.video_url && (
              <a href={project.video_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} />
                <span>Video Demo</span>
              </a>
            )}
            {project.figma_url && (
              <a href={project.figma_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} />
                <span>Figma Design</span>
              </a>
            )}
            {project.download_url && (
              <a href={project.download_url} download target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={16} />
                <span>Download Files</span>
              </a>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>Executive Summary</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '1.05rem' }}>{desc}</p>
        </div>

        {/* Problem and Solution */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          <div className="glass-card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px', color: '#e11d48' }}>The Problem</h3>
            <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {project.problem_en || 'Underspecified problem metrics.'}
            </p>
          </div>

          <div className="glass-card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px', color: '#10b981' }}>The Solution</h3>
            <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {project.solution_en || 'Underspecified solution description.'}
            </p>
          </div>
        </div>

        {/* System Architecture */}
        {project.architecture_en && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} style={{ color: 'hsl(var(--accent-primary))' }} />
              System Architecture
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6' }}>{project.architecture_en}</p>
          </div>
        )}

        {/* Features List */}
        {project.features && project.features.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '15px' }}>Core System Features</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {project.features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <Check size={16} style={{ color: 'hsl(var(--accent-primary))', marginTop: '4px', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenges and Lessons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', borderTop: '1px solid var(--border-glass)', paddingTop: '30px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Engineering Challenges</h3>
            <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {project.challenges_en || 'Overcoming latency issues and securing database queries.'}
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '10px' }}>Lessons Learned</h3>
            <p style={{ fontSize: '0.95rem', color: 'hsl(var(--text-secondary))' }}>
              {project.lessons_en || 'Decoupling application layers improves database scalability and speeds up mobile rendering.'}
            </p>
          </div>
        </div>

        {/* Development Stage and Roadmap */}
        {project.roadmap && project.roadmap.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Development Roadmap & Milestones</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {project.roadmap.map((step, idx) => (
                <div key={idx} className="glass-card" style={{ margin: 0, padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{step.milestone}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Target Date: {step.date}</span>
                  </div>
                  <span className={`badge-status ${step.stage.toLowerCase() === 'production' ? 'active' : 'draft'}`}>
                    {step.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
