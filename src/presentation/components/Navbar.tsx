import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Sun, Moon, Briefcase, Lock, Menu, X, Globe } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isRecruiterMode: boolean;
  setIsRecruiterMode: (mode: boolean) => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isRecruiterMode,
  setIsRecruiterMode,
  onOpenAdmin,
}) => {
  const { theme, accent, toggleTheme, setAccent } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setIsRecruiterMode(false);
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: t('navHome') },
    { id: 'projects', label: t('navProjects') },
    { id: 'timeline', label: t('navTimeline') },
    { id: 'gallery', label: language === 'en' ? 'Gallery' : 'ማዕከለ-ስዕላት' },
    { id: 'blog', label: t('navBlog') },
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => handleNavClick('home')}>
          <span>Addisu.me</span>
        </div>

        {/* Desktop navigation links */}
        <ul className="nav-menu">
          {navLinks.map(link => (
            <li
              key={link.id}
              className={`nav-link ${!isRecruiterMode && activeTab === link.id ? 'active' : ''}`}
              onClick={() => handleNavClick(link.id)}
            >
              {link.label}
            </li>
          ))}
        </ul>

        <div className="nav-controls">
          {/* Recruiter Toggle — desktop only */}
          <button
            className={`btn ${isRecruiterMode ? 'btn-primary' : 'btn-secondary'} recruiter-btn`}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            onClick={() => {
              setIsRecruiterMode(!isRecruiterMode);
              setMobileMenuOpen(false);
            }}
          >
            <Briefcase size={16} />
            <span>{isRecruiterMode ? 'Main Portfolio' : t('navRecruiter')}</span>
          </button>

          {/* Accent Color picker */}
          <div className="theme-picker-panel">
            {(['violet', 'emerald', 'indigo', 'crimson'] as const).map(color => (
              <span
                key={color}
                className={`accent-dot ${accent === color ? 'active' : ''}`}
                title={`Switch to ${color} accent`}
                style={{
                  backgroundColor:
                    color === 'violet' ? '#8b5cf6' :
                    color === 'emerald' ? '#10b981' :
                    color === 'indigo' ? '#3b82f6' : '#e11d48'
                }}
                onClick={() => setAccent(color)}
              />
            ))}
          </div>

          {/* Language Toggle */}
          <button
            className="nav-btn lang-toggle"
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            title="Switch Language"
          >
            <Globe size={16} style={{ marginRight: '4px' }} />
            {language === 'en' ? 'EN' : 'አማ'}
          </button>

          {/* Theme Mode Toggle */}
          <button className="nav-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Admin Login Trigger */}
          <button className="nav-btn" onClick={onOpenAdmin} title="CMS Admin Portal">
            <Lock size={18} />
          </button>

          {/* Mobile hamburger toggle */}
          <button
            className="nav-btn mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Toggle navigation"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down navigation menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: 0,
          right: 0,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '16px 24px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 99,
          boxShadow: 'var(--shadow-md)'
        }}>
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              style={{
                background: !isRecruiterMode && activeTab === link.id ? 'var(--accent-glow)' : 'transparent',
                border: 'none',
                color: !isRecruiterMode && activeTab === link.id ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--font-header)',
                fontWeight: 600,
                fontSize: '1rem',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {link.label}
            </button>
          ))}

          {/* Mobile recruiter toggle */}
          <button
            onClick={() => {
              setIsRecruiterMode(!isRecruiterMode);
              setMobileMenuOpen(false);
            }}
            style={{
              background: isRecruiterMode ? 'var(--accent-gradient)' : 'transparent',
              border: '1px solid var(--border-glass-hover)',
              color: isRecruiterMode ? '#fff' : 'hsl(var(--text-primary))',
              padding: '12px 16px',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--font-header)',
              fontWeight: 600,
              fontSize: '1rem',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Briefcase size={16} />
            {isRecruiterMode ? 'Main Portfolio' : t('navRecruiter')}
          </button>
        </div>
      )}
    </nav>
  );
};
