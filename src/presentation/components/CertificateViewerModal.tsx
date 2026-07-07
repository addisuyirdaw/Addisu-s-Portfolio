import React, { useState, useEffect, useRef } from 'react';
import type { Achievement } from '../../domain/entities';
import { achievementRepository, analyticsRepository } from '../../infrastructure/gateways';
import { X, ZoomIn, ZoomOut, Download, Share2, Maximize2, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface CertificateViewerModalProps {
  slug: string;
  onClose: () => void;
}

export const CertificateViewerModal: React.FC<CertificateViewerModalProps> = ({ slug, onClose }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [zoom, setZoom] = useState<number>(1);
  const [_isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const list = await achievementRepository.getAll();
        setAchievements(list);
        const idx = list.findIndex(a => a.slug === slug || a.id === slug);
        if (idx !== -1) {
          setCurrentIndex(idx);
          // Log analytics
          analyticsRepository.trackEvent('cert_view', { cert_id: list[idx].id, cert_title: list[idx].title_en });
        }
      } catch (err) {
        console.error('Failed to load achievements in viewer:', err);
      }
    };
    loadAchievements();
  }, [slug]);

  // Adjust routing path when active index changes
  useEffect(() => {
    if (currentIndex !== -1 && achievements[currentIndex]) {
      const activeCert = achievements[currentIndex];
      const newPath = `/certificate/${activeCert.slug || activeCert.id}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ certSlug: activeCert.slug }, '', newPath);
      }
    }
  }, [currentIndex, achievements]);

  if (currentIndex === -1 || achievements.length === 0) {
    return null;
  }

  const cert = achievements[currentIndex];
  const fileUrl = cert.file_url || cert.credential_url || '';
  const isPdf = fileUrl.toLowerCase().endsWith('.pdf');

  const handleNext = () => {
    setZoom(1);
    setCurrentIndex((prev) => (prev + 1) % achievements.length);
  };

  const handlePrev = () => {
    setZoom(1);
    setCurrentIndex((prev) => (prev - 1 + achievements.length) % achievements.length);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const copyShareLink = () => {
    const fullUrl = `${window.location.origin}/certificate/${cert.slug || cert.id}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      {/* Modal Card Panel */}
      <div 
        ref={viewerRef}
        className="glass-panel" 
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: '24px',
          padding: '24px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid var(--border-glass)'
        }}
      >
        {/* Header Controls */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--border-glass)',
          paddingBottom: '15px',
          marginBottom: '15px'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '4px', color: 'hsl(var(--accent-primary))', fontWeight: 700, textTransform: 'uppercase' }}>
              {cert.category}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>{cert.title_en}</h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>Issued by: {cert.issuer} &bull; {cert.date_earned}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="nav-btn" onClick={handleZoomOut} disabled={isPdf} title="Zoom Out" style={{ padding: '8px' }}>
              <ZoomOut size={18} />
            </button>
            <button className="nav-btn" onClick={handleZoomIn} disabled={isPdf} title="Zoom In" style={{ padding: '8px' }}>
              <ZoomIn size={18} />
            </button>
            <button className="nav-btn" onClick={toggleFullscreen} title="Fullscreen" style={{ padding: '8px' }}>
              <Maximize2 size={18} />
            </button>
            <button className="nav-btn" onClick={copyShareLink} title="Copy Share Link" style={{ padding: '8px', color: copied ? 'hsl(142.1 76.2% 36.3%)' : 'inherit' }}>
              {copied ? <Check size={18} /> : <Share2 size={18} />}
            </button>
            {fileUrl && (
              <a href={fileUrl} download={cert.title_en} className="nav-btn" title="Download Asset" style={{ padding: '8px' }} target="_blank" rel="noopener noreferrer">
                <Download size={18} />
              </a>
            )}
            <button className="nav-btn" onClick={onClose} title="Close Viewer" style={{ padding: '8px', marginLeft: '10px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Display Viewer */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          position: 'relative'
        }}>
          {/* Navigation Arrows */}
          <button 
            className="nav-btn" 
            onClick={handlePrev}
            style={{ position: 'absolute', left: '15px', zIndex: 10, padding: '12px', borderRadius: '50%', background: 'var(--bg-glass)' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="nav-btn" 
            onClick={handleNext}
            style={{ position: 'absolute', right: '15px', zIndex: 10, padding: '12px', borderRadius: '50%', background: 'var(--bg-glass)' }}
          >
            <ChevronRight size={24} />
          </button>

          {/* Doc View Content */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: '20px'
          }}>
            {isPdf ? (
              <iframe 
                src={`${fileUrl}#view=FitH`} 
                title={cert.title_en} 
                width="100%" 
                height="100%" 
                style={{ border: 'none', borderRadius: '8px' }} 
              />
            ) : fileUrl ? (
              <img 
                src={fileUrl} 
                alt={cert.title_en} 
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.15s ease'
                }} 
              />
            ) : (
              <p style={{ color: 'hsl(var(--text-muted))' }}>No certificate image or credential link uploaded.</p>
            )}
          </div>
        </div>

        {/* Carousel indicator footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '15px',
          fontSize: '0.8rem',
          color: 'hsl(var(--text-muted))',
          display: 'flex',
          justifyContent: 'center',
          gap: '5px'
        }}>
          {achievements.map((_, idx) => (
            <span 
              key={idx} 
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: idx === currentIndex ? 'hsl(var(--accent-primary))' : 'var(--border-glass)',
                display: 'inline-block',
                cursor: 'pointer'
              }}
              onClick={() => {
                setZoom(1);
                setCurrentIndex(idx);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
