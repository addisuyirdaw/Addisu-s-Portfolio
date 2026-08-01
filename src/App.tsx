import React, { useState, useEffect } from 'react';
import { Navbar } from './presentation/components/Navbar';
import { Home } from './presentation/pages/Home';
import { ProjectDetail } from './presentation/pages/ProjectDetail';
import { Admin } from './presentation/pages/Admin';
import { ResetPassword } from './presentation/pages/ResetPassword';
import { RecruiterDashboard } from './presentation/components/RecruiterDashboard';
import { ResumeBuilder } from './presentation/components/ResumeBuilder';
import { AIAssistant } from './presentation/components/AIAssistant';
import { CertificateViewerModal } from './presentation/components/CertificateViewerModal';
import { BlogDetail } from './presentation/pages/BlogDetail';
import { Gallery } from './presentation/pages/Gallery';

import { 
  defaultProjects, 
  defaultSkills, 
  defaultTimelineEvents, 
  defaultAchievements 
} from './infrastructure/gateways/MockData';
import { analyticsRepository } from './infrastructure/gateways';
import './presentation/styles/Theme.css';
import './presentation/styles/Base.css';
import './presentation/styles/Timeline.css';
import './presentation/styles/Dashboard.css';

export const App: React.FC = () => {
  // Navigation Routing States synchronized with URL
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null);
  const [selectedCertificateSlug, setSelectedCertificateSlug] = useState<string | null>(null);
  
  // Custom Modules Flags
  const [isRecruiterMode, setIsRecruiterMode] = useState(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState(false);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);

  // Synchronize browser history / URL pathnames with React states
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      // Track visitor page hit
      analyticsRepository.trackEvent('visitor_hit', { path, hash });

      // Reset all subpage states first
      setIsAdminPortalOpen(false);
      setIsResumeBuilderOpen(false);
      setIsRecruiterMode(false);
      setSelectedProjectSlug(null);
      setSelectedBlogSlug(null);
      setSelectedCertificateSlug(null);
      setIsGalleryOpen(false);
      setIsResetPasswordOpen(false);

      if (path === '/admin') {
        setIsAdminPortalOpen(true);
      } else if (path === '/reset-password') {
        setIsResetPasswordOpen(true);
      } else if (path === '/resume') {
        setIsResumeBuilderOpen(true);
      } else if (path === '/recruiter') {
        setIsRecruiterMode(true);
      } else if (path === '/gallery') {
        setIsGalleryOpen(true);
        setActiveTab('gallery');
      } else if (path.startsWith('/project/')) {
        const slug = path.split('/project/')[1];
        setSelectedProjectSlug(slug || null);
      } else if (path.startsWith('/blog/')) {
        const slug = path.split('/blog/')[1];
        setSelectedBlogSlug(slug || null);
      } else if (path.startsWith('/certificate/')) {
        const slug = path.split('/certificate/')[1];
        setSelectedCertificateSlug(slug || null);
      } else {
        // Handle home page and scrolling hashes
        setActiveTab('home');
        if (hash === '#projects') {
          setTimeout(() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }), 200);
        } else if (hash === '#timeline') {
          setTimeout(() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' }), 200);
        } else if (hash === '#blog') {
          setTimeout(() => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }), 200);
        } else if (hash === '#contact') {
          setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 200);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    // Trigger initial route parsing
    handleLocationChange();

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState(null, '', path);
    // Dispatch popstate event to trigger route handler
    window.dispatchEvent(new Event('popstate'));
  };

  // Dynamic Routing Renderer
  const renderContent = () => {
    if (isResetPasswordOpen) {
      return <ResetPassword onNavigate={navigateTo} />;
    }

    if (isAdminPortalOpen) {
      return (
        <div style={{ position: 'relative' }}>
          <div className="container" style={{ paddingTop: '80px', paddingBottom: '20px' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigateTo('/')}
              style={{ marginBottom: '10px' }}
            >
              &larr; Return to Main Site
            </button>
          </div>
          <Admin />
        </div>
      );
    }

    if (isResumeBuilderOpen) {
      return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigateTo('/')}
            style={{ marginBottom: '20px' }}
          >
            &larr; Return to Portfolio
          </button>
          <ResumeBuilder 
            skills={defaultSkills}
            projects={defaultProjects}
            experiences={defaultTimelineEvents}
            achievements={defaultAchievements}
          />
        </div>
      );
    }

    if (isRecruiterMode) {
      return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
          <RecruiterDashboard 
            skills={defaultSkills}
            projects={defaultProjects}
            experiences={defaultTimelineEvents}
            achievements={defaultAchievements}
            onOpenResumeBuilder={() => navigateTo('/resume')}
            onContactClick={() => {
              navigateTo('/#contact');
            }}
          />
        </div>
      );
    }

    if (isGalleryOpen) {
      return <Gallery />;
    }

    if (selectedProjectSlug) {
      return (
        <ProjectDetail 
          slug={selectedProjectSlug} 
          onBack={() => navigateTo('/')} 
        />
      );
    }

    if (selectedBlogSlug) {
      return (
        <BlogDetail 
          slug={selectedBlogSlug}
          onBack={() => navigateTo('/')}
        />
      );
    }

    return (
      <Home 
        onSelectProject={(slug) => navigateTo(`/project/${slug}`)}
        onOpenResumeBuilder={() => navigateTo('/resume')}
      />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Global Frosted Header */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'gallery') {
            navigateTo('/gallery');
          } else if (tab === 'home') {
            navigateTo('/');
          } else {
            navigateTo(`/#${tab}`);
          }
        }}
        isRecruiterMode={isRecruiterMode}
        setIsRecruiterMode={(mode) => {
          navigateTo(mode ? '/recruiter' : '/');
        }}
        onOpenAdmin={() => navigateTo('/admin')}
      />

      {/* Main View Port content */}
      <main style={{ flex: 1 }}>
        {renderContent()}
      </main>

      {/* Premium Certificate Viewer Modal (Overlay Sync) */}
      {selectedCertificateSlug && (
        <CertificateViewerModal 
          slug={selectedCertificateSlug} 
          onClose={() => navigateTo('/')}
        />
      )}

      {/* Floating AI Chat widget */}
      {!isAdminPortalOpen && <AIAssistant />}

      {/* Clean Recruiter Friendly Footer */}
      <footer style={{ borderTop: '1px solid var(--border-glass)', padding: '25px 0', background: 'var(--bg-glass)', textAlign: 'center' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
            &copy; {new Date().getFullYear()} Addisu Yirdaw Deresse. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
            <a href="https://github.com/addisuyirdaw" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://linkedin.com/in/addisuyirdaw2025" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://youtube.com/@adlal-me" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
