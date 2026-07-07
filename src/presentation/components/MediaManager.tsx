import React, { useState, useEffect } from 'react';
import { mediaStorage, isSupabaseMode } from '../../infrastructure/gateways';
import { supabase } from '../../infrastructure/config/supabaseClient';
import type { MediaFile } from '../../domain/entities';
import { Folder, FileText, Image as ImageIcon, Video, Trash2, Upload, ArrowLeft, Search, Copy, Check, Edit, Move } from 'lucide-react';

export const MediaManager: React.FC = () => {
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Renaming & Moving states
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [movingFileId, setMovingFileId] = useState<string | null>(null);

  // Folder names requested by user
  const folders = [
    'Projects', 
    'Certificates', 
    'Hackathons', 
    'Awards', 
    'Leadership', 
    'Gallery', 
    'Blog', 
    'Resume', 
    'Profile'
  ];

  const loadFiles = async () => {
    try {
      const items = await mediaStorage.listFiles(currentFolder);
      setFiles(items);
    } catch (err) {
      console.error('Failed to load media files:', err);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [currentFolder]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        // Optimize WebP naming & formats (simulated image check on upload)
        await mediaStorage.uploadFile(selectedFiles[i], currentFolder);
      }
      loadFiles();
    } catch (err) {
      alert('Error uploading media file. Check size limits.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filePath: string, id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this media asset?')) return;
    try {
      await mediaStorage.deleteFile(filePath, id);
      loadFiles();
    } catch (err) {
      alert('Failed to delete file.');
    }
  };

  const copyToClipboard = (path: string, id: string) => {
    const url = mediaStorage.getPublicUrl(path);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metadata Updates (Rename & Move)
  const handleRenameFile = async (fileId: string) => {
    if (!editingName.trim()) return;
    try {
      if (isSupabaseMode && supabase) {
        const { error } = await supabase
          .from('media')
          .update({ name: editingName })
          .eq('id', fileId);
        if (error) throw error;
      } else {
        const items = JSON.parse(localStorage.getItem('portfolio_media_library') || '[]');
        const idx = items.findIndex((f: any) => f.id === fileId);
        if (idx !== -1) {
          items[idx].name = editingName;
          localStorage.setItem('portfolio_media_library', JSON.stringify(items));
        }
      }
      setEditingFileId(null);
      loadFiles();
    } catch (err) {
      alert('Failed to rename file.');
    }
  };

  const handleMoveFile = async (fileId: string, targetFolder: string) => {
    try {
      if (isSupabaseMode && supabase) {
        const { error } = await supabase
          .from('media')
          .update({ folder_name: targetFolder })
          .eq('id', fileId);
        if (error) throw error;
      } else {
        const items = JSON.parse(localStorage.getItem('portfolio_media_library') || '[]');
        const idx = items.findIndex((f: any) => f.id === fileId);
        if (idx !== -1) {
          items[idx].folder_name = targetFolder;
          localStorage.setItem('portfolio_media_library', JSON.stringify(items));
        }
      }
      setMovingFileId(null);
      loadFiles();
    } catch (err) {
      alert('Failed to move file.');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon size={24} className="text-violet-500" />;
      case 'video':
        return <Video size={24} className="text-emerald-500" />;
      case 'pdf':
        return <FileText size={24} className="text-red-500" />;
      default:
        return <FileText size={24} className="text-gray-500" />;
    }
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <div className="media-manager-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          {currentFolder !== 'root' && (
            <button 
              className="btn btn-secondary" 
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '10px' }}
              onClick={() => setCurrentFolder('root')}
            >
              <ArrowLeft size={14} />
              <span>Back to Albums</span>
            </button>
          )}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {currentFolder === 'root' ? 'CMS Media Library' : `Album: ${currentFolder}`}
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="timeline-search" style={{ margin: 0 }}>
            <Search className="timeline-search-icon" size={16} />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '0.45rem 1rem 0.45rem 2.2rem' }}
            />
          </div>

          {currentFolder !== 'root' && (
            <label className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Upload size={16} />
              <span>{uploading ? 'Uploading...' : 'Upload Asset'}</span>
              <input type="file" onChange={handleFileUpload} multiple style={{ display: 'none' }} />
            </label>
          )}
        </div>
      </div>

      {currentFolder === 'root' ? (
        /* Folder Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {folders.map(f => (
            <div 
              key={f} 
              className="glass-card media-folder-card"
              onClick={() => setCurrentFolder(f)}
              style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
            >
              <Folder size={32} style={{ color: 'hsl(var(--accent-primary))' }} />
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{f}/</h4>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Open folder directory</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* File Grid View */
        <div>
          {filteredFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'hsl(var(--text-muted))' }} className="glass-panel">
              <Upload size={32} style={{ marginBottom: '10px', color: 'hsl(var(--text-muted))' }} />
              <p>This directory is empty. Upload images, videos, or PDFs to get started!</p>
            </div>
          ) : (
            <div className="media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {filteredFiles.map(file => (
                <div key={file.id} className="glass-card media-file-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                  <button 
                    className="media-delete-overlay"
                    onClick={() => handleDelete(file.file_path, file.id)}
                    title="Delete Asset"
                    style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#e11d48' }}
                  >
                    <Trash2 size={12} />
                  </button>

                  <div className="media-preview-container" style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                    {file.file_type === 'image' ? (
                      <img src={mediaStorage.getPublicUrl(file.file_path)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      getFileIcon(file.file_type)
                    )}
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    {editingFileId === file.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          value={editingName} 
                          onChange={e => setEditingName(e.target.value)} 
                          style={{ padding: '2px 4px', fontSize: '0.8rem' }}
                        />
                        <button className="nav-btn" onClick={() => handleRenameFile(file.id)} style={{ padding: '2px' }}><Check size={12} /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="media-card-name" style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={file.name}>
                          {file.name}
                        </span>
                        <button 
                          className="nav-btn" 
                          onClick={() => { setEditingFileId(file.id); setEditingName(file.name); }}
                          style={{ padding: '2px' }}
                          title="Rename Asset"
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                    )}

                    {/* Move selector */}
                    {movingFileId === file.id ? (
                      <select 
                        className="form-select" 
                        onChange={(e) => handleMoveFile(file.id, e.target.value)}
                        style={{ fontSize: '0.75rem', padding: '2px', marginTop: '6px', width: '100%' }}
                        defaultValue=""
                      >
                        <option value="" disabled>Move to folder...</option>
                        {folders.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    ) : (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setMovingFileId(file.id)}
                        style={{ fontSize: '0.7rem', padding: '2px 6px', marginTop: '6px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <Move size={10} /> Move Folder
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '5px', marginTop: '8px', justifyContent: 'center', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '6px' }}>
                    <button
                      className="nav-btn"
                      onClick={() => copyToClipboard(file.file_path, file.id)}
                      title="Copy Public URL"
                      style={{ padding: '4px' }}
                    >
                      {copiedId === file.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>
                      {(file.file_size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default MediaManager;
