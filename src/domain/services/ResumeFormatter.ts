/**
 * Domain Service: ResumeFormatter
 * Pure business logic for structuring resume/CV data.
 * Zero external dependencies — framework agnostic.
 */

import type { Skill, Project, TimelineEvent, Achievement } from '../entities';

export interface ResumeSection {
  title: string;
  items: string[];
}

export interface FormattedResume {
  fullName: string;
  headline: string;
  contact: { email: string; github: string; linkedin: string; location: string };
  summary: string;
  skills: { category: string; items: string[] }[];
  experiences: ResumeSection[];
  projects: { title: string; description: string; technologies: string[]; url?: string }[];
  achievements: { title: string; issuer: string; date: string; category: string }[];
}

export class ResumeFormatter {
  /**
   * Build a formatted resume payload from domain entities.
   * Filters and orders data by importance for professional presentation.
   */
  static format(
    skills: Skill[],
    projects: Project[],
    timeline: TimelineEvent[],
    achievements: Achievement[],
    selectedSkillIds?: string[],
    selectedProjectIds?: string[],
    selectedEventIds?: string[],
    selectedAchievementIds?: string[]
  ): FormattedResume {
    // Filter or use all items
    const filteredSkills = selectedSkillIds?.length
      ? skills.filter(s => selectedSkillIds.includes(s.id))
      : skills;

    const filteredProjects = selectedProjectIds?.length
      ? projects.filter(p => selectedProjectIds.includes(p.id))
      : projects;

    const filteredEvents = selectedEventIds?.length
      ? timeline.filter(t => selectedEventIds.includes(t.id))
      : timeline;

    const filteredAchievements = selectedAchievementIds?.length
      ? achievements.filter(a => selectedAchievementIds.includes(a.id))
      : achievements;

    // Group skills by category
    const skillCategories = ['Programming', 'Development', 'AI', 'Business'] as const;
    const groupedSkills = skillCategories
      .map(cat => ({
        category: cat,
        items: filteredSkills
          .filter(s => s.category === cat)
          .sort((a, b) => b.proficiency - a.proficiency)
          .map(s => `${s.name} (${s.proficiency}%)`)
      }))
      .filter(g => g.items.length > 0);

    // Format timeline as experience sections
    const experiences: ResumeSection[] = filteredEvents.map(event => ({
      title: `${event.title_en} — ${event.organization_en} (${ResumeFormatter.formatDateRange(event.start_date, event.end_date)})`,
      items: event.description_en
    }));

    // Format projects
    const formattedProjects = filteredProjects.map(p => ({
      title: p.title,
      description: p.description_en,
      technologies: p.technologies,
      url: p.demo_url || p.github_url
    }));

    // Format achievements
    const formattedAchievements = filteredAchievements.map(a => ({
      title: a.title_en,
      issuer: a.issuer,
      date: a.date_earned,
      category: a.category
    }));

    return {
      fullName: 'Addisu Yirdaw Deresse',
      headline: 'Computer Science & Business Administration | AI & Mobile App Developer | Student Leader',
      contact: {
        email: 'addisulal@gmail.com',
        github: 'github.com/addisuyirdaw',
        linkedin: 'linkedin.com/in/addisuyirdaw2025',
        location: 'Ethiopia (UTC+3)'
      },
      summary:
        'Innovative and results-driven Computer Science and Business Administration student with expertise in AI-assisted development, mobile applications, and accessibility-first design. Experienced in building healthcare, education, and campus management platforms using React Native, TypeScript, and Supabase. Passionate about deploying technology that improves lives.',
      skills: groupedSkills,
      experiences,
      projects: formattedProjects,
      achievements: formattedAchievements
    };
  }

  /**
   * Convert a resume to a plain text representation (for copy-paste or download).
   */
  static toPlainText(resume: FormattedResume): string {
    const lines: string[] = [];
    const divider = '─'.repeat(60);

    lines.push(resume.fullName.toUpperCase());
    lines.push(resume.headline);
    lines.push(`📧 ${resume.contact.email} | 💼 ${resume.contact.linkedin} | 🐙 ${resume.contact.github}`);
    lines.push(`📍 ${resume.contact.location}`);
    lines.push(divider);

    lines.push('PROFESSIONAL SUMMARY');
    lines.push(resume.summary);
    lines.push(divider);

    if (resume.skills.length > 0) {
      lines.push('TECHNICAL SKILLS');
      resume.skills.forEach(group => {
        lines.push(`${group.category}: ${group.items.join(', ')}`);
      });
      lines.push(divider);
    }

    if (resume.experiences.length > 0) {
      lines.push('EXPERIENCE & EDUCATION');
      resume.experiences.forEach(exp => {
        lines.push(`\n${exp.title}`);
        exp.items.forEach(item => lines.push(`  • ${item}`));
      });
      lines.push(divider);
    }

    if (resume.projects.length > 0) {
      lines.push('PROJECTS');
      resume.projects.forEach(proj => {
        lines.push(`\n${proj.title}`);
        lines.push(`  ${proj.description}`);
        lines.push(`  Technologies: ${proj.technologies.join(', ')}`);
        if (proj.url) lines.push(`  URL: ${proj.url}`);
      });
      lines.push(divider);
    }

    if (resume.achievements.length > 0) {
      lines.push('CERTIFICATIONS & AWARDS');
      resume.achievements.forEach(ach => {
        lines.push(`  • ${ach.title} — ${ach.issuer} (${ach.date})`);
      });
    }

    return lines.join('\n');
  }

  private static formatDateRange(start: string, end: string | null): string {
    const startYear = new Date(start).getFullYear();
    if (!end) return `${startYear} — Present`;
    const endYear = new Date(end).getFullYear();
    return startYear === endYear ? `${startYear}` : `${startYear} — ${endYear}`;
  }
}
