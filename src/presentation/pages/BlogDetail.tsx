import React, { useState, useEffect } from 'react';
import type { Blog } from '../../domain/entities';
import { blogRepository, analyticsRepository } from '../../infrastructure/gateways';
import { ArrowLeft, Calendar, Clock, Link2, Check } from 'lucide-react';

interface BlogDetailProps {
  slug: string;
  onBack: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ slug, onBack }) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [blogsList, setBlogsList] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      setError('');
      try {
        const item = await blogRepository.getBySlug(slug);
        setBlog(item);
        
        // Log view analytics
        analyticsRepository.trackEvent('blog_view', { blog_id: item.id, blog_title: item.title_en });
        blogRepository.incrementViews(item.id);

        const list = await blogRepository.getAll(false);
        setBlogsList(list.filter(b => b.id !== item.id).slice(0, 3));
      } catch (err) {
        setError('Blog article not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlogData();
  }, [slug]);

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'hsl(var(--text-muted))' }}>Loading Article...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
        <p style={{ color: 'hsl(var(--text-primary))', fontSize: '1.2rem', fontWeight: 600 }}>{error || 'Article not found.'}</p>
        <button className="btn btn-primary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Return to Home</span>
        </button>
      </div>
    );
  }

  const copyShareLink = () => {
    const fullUrl = `${window.location.origin}/blog/${blog.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple Markdown to HTML formatter
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      
      if (!trimmed) {
        return <div key={idx} style={{ height: '15px' }} />;
      }
      
      // Headers
      if (trimmed.startsWith('# ')) {
        return <h1 key={idx} style={{ fontSize: '2rem', fontWeight: 800, marginTop: '25px', marginBottom: '15px' }}>{trimmed.slice(2)}</h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={idx} style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '20px', marginBottom: '10px', color: 'hsl(var(--accent-primary))' }}>{trimmed.slice(3)}</h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={idx} style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '15px', marginBottom: '8px' }}>{trimmed.slice(4)}</h3>;
      }

      // Blockquotes
      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} style={{
            borderLeft: '4px solid hsl(var(--accent-primary))',
            padding: '10px 20px',
            background: 'var(--accent-glow)',
            borderRadius: '0 8px 8px 0',
            margin: '15px 0',
            fontStyle: 'italic',
            color: 'hsl(var(--text-secondary))'
          }}>
            {trimmed.slice(2)}
          </blockquote>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} style={{
            marginLeft: '20px',
            marginBottom: '6px',
            color: 'hsl(var(--text-secondary))',
            listStyleType: 'disc'
          }}>
            {parseInlineStyles(trimmed.slice(2))}
          </li>
        );
      }

      // Paragraphs
      return (
        <p key={idx} style={{
          fontSize: '1.05rem',
          lineHeight: '1.7',
          color: 'hsl(var(--text-secondary))',
          marginBottom: '15px'
        }}>
          {parseInlineStyles(trimmed)}
        </p>
      );
    });
  };

  // Basic formatter for bold and links
  const parseInlineStyles = (text: string) => {
    // Bold matching **text**
    let parts: React.ReactNode[] = [];
    let currentIdx = 0;
    
    // Quick regex for bold **word** and link [label](url)
    const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const matchStart = match.index;
      const matchedText = match[0];
      
      // Add text before match
      if (matchStart > currentIdx) {
        parts.push(text.substring(currentIdx, matchStart));
      }
      
      if (matchedText.startsWith('**')) {
        parts.push(<strong key={matchStart} style={{ fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{matchedText.slice(2, -2)}</strong>);
      } else if (matchedText.startsWith('[')) {
        const label = matchedText.substring(1, matchedText.indexOf(']'));
        const url = matchedText.substring(matchedText.indexOf('(') + 1, matchedText.indexOf(')'));
        parts.push(
          <a key={matchStart} href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600, textDecoration: 'underline' }}>
            {label}
          </a>
        );
      }
      
      currentIdx = regex.lastIndex;
    }
    
    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }
    
    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="container" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
      {/* Back navigation */}
      <button 
        className="btn btn-secondary" 
        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginBottom: '20px' }}
        onClick={onBack}
      >
        <ArrowLeft size={14} />
        <span>Back to Portfolio</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Main Article Content */}
        <article className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
          {blog.cover_image && (
            <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden', borderRadius: '16px', marginBottom: '25px' }}>
              <img src={blog.cover_image} alt={blog.title_en} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {/* Meta bar */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', fontSize: '0.85rem', color: 'hsl(var(--text-muted))', marginBottom: '15px' }}>
            <span style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: '4px', color: 'hsl(var(--accent-primary))', fontWeight: 700 }}>
              {blog.category}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={14} />
              {new Date(blog.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} />
              {blog.reading_time || '5 min read'}
            </span>
            <span>&bull; {blog.views_count} views</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px', lineHeight: 1.2 }}>{blog.title_en}</h1>

          {/* Share Shortcuts Bar */}
          <div style={{
            display: 'flex',
            gap: '10px',
            borderTop: '1px solid var(--border-glass)',
            borderBottom: '1px solid var(--border-glass)',
            padding: '12px 0',
            margin: '20px 0',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-muted))' }}>Share:</span>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.title_en)}`} target="_blank" rel="noopener noreferrer" className="nav-btn" style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              𝕏
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="nav-btn" style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 700 }}>
              in
            </a>
            <button className="nav-btn" onClick={copyShareLink} style={{ padding: '6px', color: copied ? 'hsl(142.1 76.2% 36.3%)' : 'inherit' }} title="Copy share link">
              {copied ? <Check size={16} /> : <Link2 size={16} />}
            </button>
          </div>

          {/* Formatted body */}
          <div style={{ marginTop: '20px' }}>
            {renderMarkdown(blog.content_en)}
          </div>

          {/* Tags list */}
          {blog.tags && blog.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '30px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
              {blog.tags.map(tag => (
                <span key={tag} style={{ fontSize: '0.75rem', background: 'var(--border-glass)', padding: '4px 10px', borderRadius: '20px', color: 'hsl(var(--text-secondary))' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Related Posts panel */}
        {blogsList.length > 0 && (
          <aside className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginTop: '30px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              Related Articles
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {blogsList.map(post => (
                <div 
                  key={post.id} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    // Update slug in URL
                    window.history.pushState(null, '', `/blog/${post.slug}`);
                    // Trigger load by forcing state reload
                    window.dispatchEvent(new Event('popstate'));
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--accent-primary))', fontWeight: 700 }}>
                    {post.category}
                  </span>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '4px', marginBottom: '4px' }}>
                    {post.title_en}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                    {post.reading_time || '4 min read'}
                  </span>
                </div>
              ))}
            </div>
          </aside>
        )}

      </div>
    </div>
  );
};
export default BlogDetail;
