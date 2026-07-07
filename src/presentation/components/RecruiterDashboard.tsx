import type { Project, TimelineEvent, Skill, Achievement } from '../../domain/entities';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Award, Briefcase, FileText, CheckCircle } from 'lucide-react';

interface RecruiterDashboardProps {
  skills: Skill[];
  projects: Project[];
  experiences: TimelineEvent[];
  achievements: Achievement[];
  onOpenResumeBuilder: () => void;
  onContactClick: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  skills,
  projects,
  experiences,
  achievements: _achievements,
  onOpenResumeBuilder,
  onContactClick
}) => {
  const { t } = useLanguage();

  const topSkills = skills.slice(0, 8);
  const topProjects = projects.filter(p => p.is_featured).slice(0, 3);
  const activeJobs = experiences.filter(e => e.category === 'Education' || e.category === 'Leadership').slice(0, 3);


  return (
    <div className="glass-panel" style={{ padding: '30px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Header Info */}
      <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'hsl(var(--accent-primary))', letterSpacing: '0.1em' }}>
            {t('recruiterMode')}
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '5px' }}>Addisu Yirdaw Deresse</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', fontWeight: 500, fontSize: '1.1rem', marginTop: '4px' }}>
            Computer Science & Business Admin Student | AI & Mobile App Developer | Future Tech Entrepreneur
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={onOpenResumeBuilder}>
            <FileText size={16} />
            <span>Generate Custom Resume</span>
          </button>
          <button className="btn btn-secondary" onClick={onContactClick}>
            <Mail size={16} />
            <span>Direct Email</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
        
        {/* Left Col: Core Summary & Skills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Executive Summary */}
          <div className="glass-card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} style={{ color: 'hsl(var(--accent-primary))' }} />
              Executive Summary
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              Double-degree candidate in Computer Science and Business Administration based in Ethiopia. Specialized in accessibility design, AI tooling automation, and mobile applications (React Native/Expo). Student leader who built campus-wide voting and club networking platforms. Seeking remote internships, technical partnerships, or full-time roles.
            </p>
          </div>

          {/* Top Technical Skills */}
          <div className="glass-card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '15px' }}>Top Core Skills</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {topSkills.map(skill => (
                <div key={skill.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                    <span>{skill.name}</span>
                    <span style={{ color: 'hsl(var(--accent-primary))' }}>{skill.proficiency}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--border-glass)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${skill.proficiency}%`, background: 'var(--accent-gradient)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Mid Col: Top Featured Ventures */}
        <div className="glass-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} style={{ color: 'hsl(var(--accent-primary))' }} />
            Key Projects & Business Impact
          </h3>

          {topProjects.map(project => (
            <div key={project.id} style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '12px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{project.title}</h4>
                <a 
                  href={project.github_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ fontSize: '0.8rem', color: 'hsl(var(--accent-primary))', fontWeight: 700 }}
                >
                  GitHub &rarr;
                </a>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', lineHeight: '1.4' }}>
                {project.description_en}
              </p>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '6px' }}>
                {project.technologies.slice(0, 4).map(tech => (
                  <span key={tech} style={{ fontSize: '0.7rem', background: 'var(--border-glass)', padding: '2px 6px', borderRadius: '4px' }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Timeline & Contact */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Active Positions */}
          <div className="glass-card" style={{ margin: 0 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={18} style={{ color: 'hsl(var(--accent-primary))' }} />
              Active Engagements
            </h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none' }}>
              {activeJobs.map(job => (
                <li key={job.id} style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700 }}>{job.title_en}</div>
                  <div style={{ color: 'hsl(var(--text-muted))' }}>{job.organization_en} &bull; {job.start_date.substring(0, 4)} - Present</div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick contact box */}
          <div className="glass-card" style={{ margin: 0, background: 'var(--accent-glow)', borderColor: 'hsl(var(--accent-primary))' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '12px' }}>Recruitment Channels</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Mail size={16} />
                <a href="mailto:addisulal@gmail.com" style={{ fontWeight: 600 }}>addisulal@gmail.com</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <CheckCircle size={16} />
                <a href="https://linkedin.com/in/addisuyirdaw2025" target="_blank" rel="noopener noreferrer">LinkedIn Profile</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <CheckCircle size={16} />
                <a href="https://github.com/addisuyirdaw" target="_blank" rel="noopener noreferrer">GitHub Code repositories</a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
