import React, { useState } from 'react';
import type { TimelineEvent } from '../../domain/entities';
import { useLanguage } from '../context/LanguageContext';
import { Search, GraduationCap, Award, Flag, Users, Briefcase, Heart } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Education', 'Leadership', 'Certificates', 'Hackathons', 'Projects', 'Volunteer'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Education':
        return <GraduationCap size={16} />;
      case 'Certificates':
      case 'Award':
        return <Award size={16} />;
      case 'Hackathons':
        return <Flag size={16} />;
      case 'Leadership':
        return <Users size={16} />;
      case 'Projects':
        return <Briefcase size={16} />;
      case 'Volunteer':
        return <Heart size={16} />;
      default:
        return <Award size={16} />;
    }
  };

  const filteredEvents = events.filter(event => {
    // Category match
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;

    // Search query match
    const title = language === 'am' && event.title_am ? event.title_am : event.title_en;
    const org = event.organization_en;
    const searchString = `${title} ${org} ${event.category} ${event.description_en.join(' ')}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="timeline-section-container">
      {/* Filters Bar */}
      <div className="glass-panel timeline-filters-bar">
        <div className="timeline-search">
          <Search className="timeline-search-icon" size={16} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="timeline-category-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Timeline Track */}
      <div className="timeline-track">
        {filteredEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
            No records matched your search filters.
          </div>
        ) : (
          filteredEvents.map(event => {
            const title = language === 'am' && event.title_am ? event.title_am : event.title_en;
            const desc = language === 'am' && event.description_am ? event.description_am : event.description_en;

            return (
              <div 
                key={event.id} 
                className={`timeline-item ${event.featured ? 'featured' : ''}`}
              >
                <div className="timeline-marker" title={event.category}>
                  {getCategoryIcon(event.category)}
                </div>

                <div className="glass-card timeline-card">
                  <div className="timeline-card-header">
                    <span className="timeline-tag-category">{event.category}</span>
                    <span className="timeline-date-label">
                      {event.start_date.substring(0, 7)} to {event.end_date ? event.end_date.substring(0, 7) : t('experiencePresent')}
                    </span>
                  </div>

                  <h3 className="timeline-event-title">{title}</h3>
                  <div className="timeline-event-org">{event.organization_en}</div>

                  <div className="timeline-event-body">
                    <ul>
                      {desc.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>

                  {event.verification_url && (
                    <a 
                      href={event.verification_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        fontSize: '0.8rem', 
                        color: 'hsl(var(--accent-primary))',
                        marginTop: '12px',
                        fontWeight: '700'
                      }}
                    >
                      Verify Record &rarr;
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
