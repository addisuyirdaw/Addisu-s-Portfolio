import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ArrowRight, MessageSquare, Download } from 'lucide-react';

interface HeroProps {
  onExploreProjects: () => void;
  onContactClick: () => void;
  onOpenResumeBuilder: () => void;
  stats: {
    projects: number;
    certificates: number;
    hours: number;
    impacted: number;
  };
}

export const Hero: React.FC<HeroProps> = ({
  onExploreProjects,
  onContactClick,
  onOpenResumeBuilder,
  stats
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();

    // Create particles
    const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }

    let mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      
      // Node lines color
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';

      // Draw and update
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce walls
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Repel mouse
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (dist2 < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="hero-section">
      <div className="particle-background-container">
        <canvas ref={canvasRef} style={{ display: 'block' }} />
      </div>
      <div className="container">
        <div className="hero-layout">
          <div>
            <span className="hero-subtitle">{t('heroGreeting')}</span>
            <h1 className="hero-title">Addisu Yirdaw Deresse</h1>
            <p className="hero-headline">
              Computer Science & Business Administration Double-Major | AI & Mobile App Developer | Student Leader | Future Technology Entrepreneur
            </p>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '2rem', maxWidth: '600px', fontSize: '1.05rem' }}>
              Building premium technology solutions that improve people's lives through innovation, accessibility, healthcare, and education. Dedicated to engineering zero-trust architectures and intelligent AI systems.
            </p>
            
            <div className="hero-ctas">
              <button className="btn btn-primary" onClick={onExploreProjects}>
                <span>{t('heroCTAProjects')}</span>
                <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary" onClick={onContactClick}>
                <MessageSquare size={18} />
                <span>{t('heroCTAContact')}</span>
              </button>
              <button className="btn btn-secondary" onClick={onOpenResumeBuilder}>
                <Download size={18} />
                <span>Resume Builder</span>
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="glass-card hero-profile-box" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
              <div className="hero-glow-blob" />
              
              {/* Profile Photo with gradient ring */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  padding: '3px',
                  background: 'var(--accent-gradient)',
                  boxShadow: '0 0 30px var(--accent-glow)'
                }}>
                  <img
                    src="/profile-avatar.png"
                    alt="Addisu Yirdaw Deresse"
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                    onError={(e) => {
                      // Fallback to initials if image fails
                      const el = e.currentTarget.parentElement!;
                      el.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:2.5rem;font-weight:800;color:#fff">AY</div>';
                    }}
                  />
                </div>
                {/* Online Status Dot */}
                <span style={{
                  position: 'absolute',
                  bottom: '6px',
                  right: '6px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '3px solid hsl(var(--bg-primary))',
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)'
                }} title="Available for opportunities" />
              </div>

              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Addisu Y. Deresse</h3>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>🇪🇹 Ethiopia &bull; UTC+3</p>
              </div>

              {/* Status badge */}
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981'
              }}>
                ✓ Open to Opportunities
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                <div style={{ background: 'var(--border-glass)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'hsl(var(--accent-primary))' }}>{stats.projects}+</div>
                  <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))' }}>Projects</div>
                </div>
                <div style={{ background: 'var(--border-glass)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'hsl(var(--accent-primary))' }}>{stats.certificates}+</div>
                  <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))' }}>Certificates</div>
                </div>
                <div style={{ background: 'var(--border-glass)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'hsl(var(--accent-primary))' }}>{stats.hours}+</div>
                  <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))' }}>Volunteer Hrs</div>
                </div>
                <div style={{ background: 'var(--border-glass)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'hsl(var(--accent-primary))' }}>{stats.impacted}+</div>
                  <div style={{ fontSize: '0.68rem', color: 'hsl(var(--text-secondary))' }}>Users Impacted</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
