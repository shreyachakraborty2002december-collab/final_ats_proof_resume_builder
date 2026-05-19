/**
 * Template Registry
 * Maps templateId → { component, meta }
 * Add new templates here to make them available in the selector.
 */
import DefaultTemplate   from './DefaultTemplate';
import ModernTemplate    from './ModernTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';
import MinimalTemplate   from './MinimalTemplate';
import CreativeTemplate  from './CreativeTemplate';
import TechTemplate      from './TechTemplate';
import ElegantTemplate   from './ElegantTemplate';
import BoldTemplate      from './BoldTemplate';

export const TEMPLATES = {
  default: {
    id:          'default',
    name:        'Classic',
    description: 'Clean, ATS-friendly layout. Works everywhere.',
    accent:      '#1a1a2e',
    isPro:       false,
    component:   DefaultTemplate,
    preview: {
      header: '#1a1a2e',
      accent: '#1a1a2e',
      bg:     '#ffffff',
    },
  },
  modern: {
    id:          'modern',
    name:        'Modern',
    description: 'Purple accent lines with bold section headers.',
    accent:      '#7c3aed',
    isPro:       true,
    component:   ModernTemplate,
    preview: {
      header: '#7c3aed',
      accent: '#7c3aed',
      bg:     '#faf8ff',
    },
  },
  executive: {
    id:          'executive',
    name:        'Executive',
    description: 'Corporate two-tone with a bold name header.',
    accent:      '#1e3a5f',
    isPro:       true,
    component:   ExecutiveTemplate,
    preview: {
      header: '#1e3a5f',
      accent: '#2563eb',
      bg:     '#f8f9fc',
    },
  },
  minimal: {
    id:          'minimal',
    name:        'Minimal',
    description: 'Typography-first, ultra-clean whitespace.',
    accent:      '#374151',
    isPro:       true,
    component:   MinimalTemplate,
    preview: {
      header: '#111827',
      accent: '#6b7280',
      bg:     '#ffffff',
    },
  },
  creative: {
    id:          'creative',
    name:        'Creative',
    description: 'Teal sidebar split-column for designers.',
    accent:      '#0d9488',
    isPro:       true,
    component:   CreativeTemplate,
    preview: {
      header: '#0d9488',
      accent: '#0d9488',
      bg:     '#f0fdfa',
    },
  },
  tech: {
    id:          'tech',
    name:        'Tech',
    description: 'Developer-focused with dark header & code accents.',
    accent:      '#10b981',
    isPro:       true,
    component:   TechTemplate,
    preview: {
      header: '#0f172a',
      accent: '#10b981',
      bg:     '#f8fafc',
    },
  },
  elegant: {
    id:          'elegant',
    name:        'Elegant',
    description: 'Serif-inspired with gold tones and refined spacing.',
    accent:      '#b45309',
    isPro:       true,
    component:   ElegantTemplate,
    preview: {
      header: '#faf6f0',
      accent: '#b45309',
      bg:     '#fffbf5',
    },
  },
  bold: {
    id:          'bold',
    name:        'Bold',
    description: 'High-contrast with a commanding dark header bar.',
    accent:      '#dc2626',
    isPro:       true,
    component:   BoldTemplate,
    preview: {
      header: '#111111',
      accent: '#dc2626',
      bg:     '#ffffff',
    },
  },
};

/** Returns the template component for a given ID (falls back to default). */
export function getTemplate(id) {
  return TEMPLATES[id]?.component ?? DefaultTemplate;
}

/** Ordered list for display in the selector. */
export const TEMPLATE_LIST = Object.values(TEMPLATES);
