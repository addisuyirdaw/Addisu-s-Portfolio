import React, { useState, useEffect } from 'react';
import { mediaStorage, isSupabaseMode } from '../../infrastructure/gateways';
import { supabase } from '../../infrastructure/config/supabaseClient';
import type { MediaFile } from '../../domain/entities';
import { Search, Image as ImageIcon, Video, Folder, Calendar, X, ChevronLeft, ChevronRight, Download, Share2, Check } from 'lucide-react';

export const Gallery: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [selectedAlbum, setSelectedAlbum] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [displayCount, setDisplayCount] = useState(12);
  
  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);

  // Albums definition
  const albums = ['All', 'Projects', 'Certificates', 'Hackathons', 'Awards', 'Leadership', 'Blogs', 'General'];

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      try {
        let items: MediaFile[] = [];
        if (isSupabaseMode && supabase) {
          const { data, error } = await supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false });
          if (!error && data) items = data;
        } else {
          items = JSON.parse(localStorage.getItem('portfolio_media_library') || '[]');
        }
        setMediaList(items);
      } catch (err) {
        console.error('Failed to load gallery items:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, []);

  const getMediaUrl = (file: MediaFile) => {
    if (file.file_path.startsWith('data:')) {
      return file.file_path; // Base64 mock
    }
    return mediaStorage.getPublicUrl(file.file_path);
  };

  // Filter logic
  const filteredMedia = mediaList.filter(item => {
    const matchesAlbum = selectedAlbum === 'All' || item.folder_name.toLowerCase() === selectedAlbum.toLowerCase();
    const matchesType = selectedType === 'All' || item.file_type === selectedType;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAlbum && matchesType && matchesSearch;
  });

  const paginatedMedia = filteredMedia.slice(0, displayCount);

  // Lightbox handlers
  const handleOpenLightbox = (index: number) => {
    setZoom(1);
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom(1);
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredMedia.length);
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoom(1);
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredMedia.length) % filteredMedia.length);
    }
  };

  const copyShareLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
          Photo & Media Gallery
        </h1>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '10px' }}>
          A history of innovation challenges, hackathons, workshops, and campus leadership roles.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px', marginBottom: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
          {/* Search */}
          <div className="timeline-search" style={{ margin: 0, width: '100%' }}>
            <Search className="timeline-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search assets by name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDisplayCount(12);
              }}
              style={{ paddingLeft: '2.2rem', width: '100%' }}
            />
          </div>

          {/* Type Filter */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`filter-chip ${selectedType === 'All' ? 'active' : ''}`}
              onClick={() => { setSelectedType('All'); setDisplayCount(12); }}
              style={{ flex: 1 }}
            >
              All Types
            </button>
            <button 
              className={`filter-chip ${selectedType === 'image' ? 'active' : ''}`}
              onClick={() => { setSelectedType('image'); setDisplayCount(12); }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ImageIcon size={14} /> Images
            </button>
            <button 
              className={`filter-chip ${selectedType === 'video' ? 'active' : ''}`}
              onClick={() => { setSelectedType('video'); setDisplayCount(12); }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <Video size={14} /> Videos
            </button>
          </div>
        </div>

        {/* Albums Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-muted))', alignSelf: 'center', marginRight: '5px' }}>
            Albums:
          </span>
          {albums.map(alb => (
            <button
              key={alb}
              className={`filter-chip ${selectedAlbum === alb ? 'active' : ''}`}
              onClick={() => { setSelectedAlbum(alb); setDisplayCount(12); }}
            >
              {alb}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <p style={{ color: 'hsl(var(--text-muted))' }}>Loading media files...</p>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px', borderRadius: '24px', color: 'hsl(var(--text-muted))' }}>
          <Folder size={48} style={{ marginBottom: '15px', color: 'var(--accent-glow)' }} />
          <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>No media files matched your selection.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>Upload photos or videos inside the Admin Dashboard Media manager.</p>
        </div>
      ) : (
        /* Masonry Grid View */
        <div>
          <div style={{
            columns: '3 280px',
            columnGap: '20px',
            width: '100%',
            margin: '0 auto'
          }}>
            {paginatedMedia.map((file, index) => {
              const url = getMediaUrl(file);
              return (
                <div 
                  key={file.id} 
                  className="glass-card" 
                  onClick={() => handleOpenLightbox(index)}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: '20px',
                    padding: '12px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-fast) ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '100%',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '140px'
                  }}>
                    {file.file_type === 'image' ? (
                      <img 
                        src={url} 
                        alt={file.name} 
                        style={{ width: '100%', display: 'block', objectFit: 'cover' }} 
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '30px' }}>
                        <Video size={36} style={{ color: 'hsl(var(--accent-primary))' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Play Video Clip</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase', fontWeight: 700, color: 'hsl(var(--accent-primary))' }}>
                        <Folder size={10} /> {file.folder_name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={10} /> {file.created_at.substring(0, 10)}
                      </span>
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name.substring(0, file.name.lastIndexOf('.')) || file.name}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Pagination */}
          {filteredMedia.length > displayCount && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <button 
                className="btn btn-primary"
                onClick={() => setDisplayCount(prev => prev + 12)}
              >
                Load More Items
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && filteredMedia[lightboxIndex] && (() => {
        const file = filteredMedia[lightboxIndex];
        const url = getMediaUrl(file);
        
        return (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.92)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '20px'
            }}
            onClick={handleCloseLightbox}
          >
            {/* Header Control overlay */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              zIndex: 10
            }} onClick={e => e.stopPropagation()}>
              <div>
                <span style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '4px', color: 'hsl(var(--accent-primary))', fontWeight: 700 }}>
                  Album: {file.folder_name}
                </span>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginTop: '4px' }}>{file.name}</h3>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="nav-btn" onClick={() => setZoom(z => Math.min(z + 0.25, 3))} disabled={file.file_type !== 'image'} style={{ padding: '8px', color: '#fff' }}>
                  Zoom In
                </button>
                <button className="nav-btn" onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))} disabled={file.file_type !== 'image'} style={{ padding: '8px', color: '#fff' }}>
                  Zoom Out
                </button>
                <button className="nav-btn" onClick={(e) => copyShareLink(e, url)} style={{ padding: '8px', color: copied ? '#10b981' : '#fff' }} title="Copy Public URL">
                  {copied ? <Check size={18} /> : <Share2 size={18} />}
                </button>
                <a href={url} download={file.name} className="nav-btn" style={{ padding: '8px', color: '#fff' }} target="_blank" rel="noopener noreferrer" title="Download file">
                  <Download size={18} />
                </a>
                <button className="nav-btn" onClick={handleCloseLightbox} style={{ padding: '8px', color: '#fff', marginLeft: '10px' }} title="Close">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Slider Main Viewport */}
            <div style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              margin: '20px 0'
            }}>
              {/* Arrows */}
              <button 
                className="nav-btn" 
                onClick={handlePrev}
                style={{ position: 'absolute', left: '10px', zIndex: 10, padding: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                className="nav-btn" 
                onClick={handleNext}
                style={{ position: 'absolute', right: '10px', zIndex: 10, padding: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <ChevronRight size={24} />
              </button>

              <div style={{
                maxHeight: '100%',
                maxWidth: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto'
              }} onClick={e => e.stopPropagation()}>
                {file.file_type === 'image' ? (
                  <img 
                    src={url} 
                    alt={file.name} 
                    style={{
                      maxHeight: '80vh',
                      maxWidth: '90vw',
                      objectFit: 'contain',
                      transform: `scale(${zoom})`,
                      transition: 'transform 0.15s ease',
                      borderRadius: '8px'
                    }} 
                  />
                ) : (
                  <video 
                    src={url} 
                    controls 
                    autoPlay 
                    style={{ maxHeight: '80vh', maxWidth: '90vw', borderRadius: '8px' }} 
                  />
                )}
              </div>
            </div>

            {/* Indicator Footer */}
            <div style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.85rem'
            }}>
              Slide {lightboxIndex + 1} of {filteredMedia.length}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
export default Gallery;
