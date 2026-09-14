import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Achievement } from '../../domain/entities';
import { achievementRepository, analyticsRepository } from '../../infrastructure/gateways';
import { X, ZoomIn, ZoomOut, Download, Share2, Maximize2, ChevronLeft, ChevronRight, Check, ExternalLink, FileText, Shield } from 'lucide-react';

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

  const handleNext = useCallback(() => {
    setZoom(1);
    setCurrentIndex((prev) => (prev + 1) % achievements.length);
  }, [achievements.length]);

  const handlePrev = useCallback(() => {
    setZoom(1);
    setCurrentIndex((prev) => (prev - 1 + achievements.length) % achievements.length);
  }, [achievements.length]);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  if (currentIndex === -1 || achievements.length === 0) {
    return null;
  }

  const cert = achievements[currentIndex];
  const fileUrl = cert?.file_url || '';
  const credentialUrl = cert?.credential_url || '';
  const isPdf = fileUrl.toLowerCase().includes('.pdf');
  const isImage = !isPdf && (/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(fileUrl) || fileUrl.startsWith('data:image'));

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
          maxWidth: '960px',
          height: '92vh',
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
          marginBottom: '15px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '4px', color: 'hsl(var(--accent-primary))', fontWeight: 700, textTransform: 'uppercase' }}>
                {cert.category}
              </span>
              {isPdf && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  PDF Document
                </span>
              )}
              {isImage && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Image
                </span>
              )}
              {credentialUrl && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                  Verified Credential
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>{cert.title_en}</h3>
            <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))' }}>
              Issued by: <strong>{cert.issuer}</strong> &bull; {cert.date_earned}
              {cert.credential_id && <span> &bull; ID: {cert.credential_id}</span>}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Quick verify button if external credential exists */}
            {credentialUrl && (
              <a
                href={credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#34d399', borderColor: 'rgba(16,185,129,0.4)' }}
                title="Verify on official issuer site"
              >
                <ExternalLink size={14} />
                <span>Verify Online ↗</span>
              </a>
            )}

            {isImage && (
              <>
                <button className="nav-btn" onClick={handleZoomOut} title="Zoom Out" style={{ padding: '8px' }}>
                  <ZoomOut size={18} />
                </button>
                <button className="nav-btn" onClick={handleZoomIn} title="Zoom In" style={{ padding: '8px' }}>
                  <ZoomIn size={18} />
                </button>
              </>
            )}

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
            <button className="nav-btn" onClick={onClose} title="Close Viewer (Esc)" style={{ padding: '8px', marginLeft: '6px' }}>
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
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '16px',
          position: 'relative'
        }}>
          {/* Navigation Arrows */}
          {achievements.length > 1 && (
            <>
              <button 
                className="nav-btn" 
                onClick={handlePrev}
                title="Previous Certificate (Left Arrow)"
                style={{ position: 'absolute', left: '15px', zIndex: 10, padding: '12px', borderRadius: '50%', background: 'var(--bg-glass)', backdropFilter: 'blur(8px)' }}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                className="nav-btn" 
                onClick={handleNext}
                title="Next Certificate (Right Arrow)"
                style={{ position: 'absolute', right: '15px', zIndex: 10, padding: '12px', borderRadius: '50%', background: 'var(--bg-glass)', backdropFilter: 'blur(8px)' }}
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Doc View Content */}
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: isPdf ? '0' : '20px'
          }}>
            {isPdf ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <iframe 
                  src={`${fileUrl}#view=FitH`} 
                  title={cert.title_en} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none', borderRadius: '8px', flex: 1 }} 
                />
                <div style={{ padding: '8px 16px', textAlign: 'center', fontSize: '0.78rem', color: 'hsl(var(--text-muted))', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
                  PDF Document &bull; <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>Open Full PDF in New Tab ↗</a> &bull; <a href={fileUrl} download={cert.title_en} style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>Download PDF ⬇</a>
                </div>
              </div>
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
            ) : credentialUrl ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--accent-primary))' }}>
                  <Shield size={42} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{cert.title_en}</h3>
                <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                  This credential was awarded by <strong>{cert.issuer}</strong> on <strong>{cert.date_earned}</strong>.
                  {cert.credential_id && (
                    <span style={{ display: 'block', marginTop: '6px' }}>
                      Credential ID: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px' }}>{cert.credential_id}</code>
                    </span>
                  )}
                </p>
                <a
                  href={credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.95rem', marginTop: '10px' }}
                >
                  <ExternalLink size={16} />
                  <span>Verify on Official Issuer Website ↗</span>
                </a>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'hsl(var(--text-muted))', padding: '40px' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No certificate file or verification link uploaded yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation indicator footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '15px',
          fontSize: '0.8rem',
          color: 'hsl(var(--text-muted))'
        }}>
          <span>{currentIndex + 1} of {achievements.length}</span>
          
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {achievements.map((_, idx) => (
              <span 
                key={idx} 
                style={{
                  width: idx === currentIndex ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: idx === currentIndex ? 'hsl(var(--accent-primary))' : 'var(--border-glass)',
                  display: 'inline-block',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  setZoom(1);
                  setCurrentIndex(idx);
                }}
              />
            ))}
          </div>

          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
            Tip: Use ◄ ► arrows to navigate &bull; Esc to close
          </span>
        </div>
      </div>
    </div>
  );
};
