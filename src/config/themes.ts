export type ThemeId =
  | 'default'   // NAVIKO Default — modern, clean, professional
  | 'light'     // Light — bright and minimal
  | 'dark'      // Dark — comfortable dark interface
  | 'midnight'  // Midnight — premium futuristic dark design
  | 'minimal'   // Minimal — simple and content-focused
  | 'glass';    // Glass — modern glassmorphism design

export type QuickThemeMode = 'light' | 'dark' | 'system';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  isDark: boolean;
  previewColors: {
    bg: string;
    card: string;
    primary: string;
    accent: string;
    border: string;
  };
  cssVariables: Record<string, string>;
}

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  default: {
    id: 'default',
    name: 'NAVIKO Default',
    tagline: 'Modern, clean & balanced professional palette',
    isDark: false,
    previewColors: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      primary: '#4F46E5',
      accent: '#10B981',
      border: '#E2E8F0',
    },
    cssVariables: {
      '--background': '#F8FAFC',
      '--foreground': '#0F172A',
      '--card': '#FFFFFF',
      '--card-foreground': '#0F172A',
      '--primary': '#4F46E5',
      '--primary-foreground': '#FFFFFF',
      '--secondary': '#EEF2FF',
      '--secondary-foreground': '#3730A3',
      '--accent': '#10B981',
      '--accent-foreground': '#FFFFFF',
      '--border': '#E2E8F0',
      '--muted': '#F1F5F9',
      '--muted-foreground': '#64748B',
      '--input': '#F8FAFC',
      '--input-border': '#CBD5E1',
      '--success': '#10B981',
      '--warning': '#F59E0B',
      '--danger': '#EF4444',
      '--shadow': '0 4px 6px -1px rgba(15, 23, 42, 0.07)',
      '--header-bg': 'rgba(255, 255, 255, 0.85)',
      '--glass-border': 'rgba(226, 232, 240, 0.8)',
    },
  },

  light: {
    id: 'light',
    name: 'Light',
    tagline: 'Bright, pure & crisp minimal interface',
    isDark: false,
    previewColors: {
      bg: '#FFFFFF',
      card: '#F8FAFC',
      primary: '#2563EB',
      accent: '#06B6D4',
      border: '#E5E7EB',
    },
    cssVariables: {
      '--background': '#FFFFFF',
      '--foreground': '#111827',
      '--card': '#F9FAFB',
      '--card-foreground': '#111827',
      '--primary': '#2563EB',
      '--primary-foreground': '#FFFFFF',
      '--secondary': '#EFF6FF',
      '--secondary-foreground': '#1E40AF',
      '--accent': '#06B6D4',
      '--accent-foreground': '#FFFFFF',
      '--border': '#E5E7EB',
      '--muted': '#F3F4F6',
      '--muted-foreground': '#6B7280',
      '--input': '#FFFFFF',
      '--input-border': '#D1D5DB',
      '--success': '#059669',
      '--warning': '#D97706',
      '--danger': '#DC2626',
      '--shadow': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      '--header-bg': 'rgba(255, 255, 255, 0.92)',
      '--glass-border': 'rgba(229, 231, 235, 0.8)',
    },
  },

  dark: {
    id: 'dark',
    name: 'Dark',
    tagline: 'Comfortable, low-contrast dark interface',
    isDark: true,
    previewColors: {
      bg: '#0F172A',
      card: '#1E293B',
      primary: '#6366F1',
      accent: '#38BDF8',
      border: '#334155',
    },
    cssVariables: {
      '--background': '#0F172A',
      '--foreground': '#F8FAFC',
      '--card': '#1E293B',
      '--card-foreground': '#F8FAFC',
      '--primary': '#6366F1',
      '--primary-foreground': '#FFFFFF',
      '--secondary': '#1E1B4B',
      '--secondary-foreground': '#C7D2FE',
      '--accent': '#38BDF8',
      '--accent-foreground': '#0F172A',
      '--border': '#334155',
      '--muted': '#1E293B',
      '--muted-foreground': '#94A3B8',
      '--input': '#0F172A',
      '--input-border': '#475569',
      '--success': '#34D399',
      '--warning': '#FBBF24',
      '--danger': '#F87171',
      '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.35)',
      '--header-bg': 'rgba(15, 23, 42, 0.88)',
      '--glass-border': 'rgba(51, 65, 85, 0.8)',
    },
  },

  midnight: {
    id: 'midnight',
    name: 'Midnight',
    tagline: 'Deep AMOLED black with neon violet & cyan glow',
    isDark: true,
    previewColors: {
      bg: '#020617',
      card: '#0B0F19',
      primary: '#8B5CF6',
      accent: '#06B6D4',
      border: '#1E293B',
    },
    cssVariables: {
      '--background': '#020617',
      '--foreground': '#F1F5F9',
      '--card': '#0B1120',
      '--card-foreground': '#F8FAFC',
      '--primary': '#8B5CF6',
      '--primary-foreground': '#FFFFFF',
      '--secondary': '#2E1065',
      '--secondary-foreground': '#E9D5FF',
      '--accent': '#06B6D4',
      '--accent-foreground': '#020617',
      '--border': '#1E293B',
      '--muted': '#0F172A',
      '--muted-foreground': '#64748B',
      '--input': '#020617',
      '--input-border': '#334155',
      '--success': '#10B981',
      '--warning': '#F59E0B',
      '--danger': '#EF4444',
      '--shadow': '0 8px 16px -2px rgba(0, 0, 0, 0.7), 0 0 20px rgba(139, 92, 246, 0.15)',
      '--header-bg': 'rgba(2, 6, 23, 0.92)',
      '--glass-border': 'rgba(30, 41, 59, 0.8)',
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'High-focus monochrome simplicity for pure clarity',
    isDark: false,
    previewColors: {
      bg: '#FAFAFA',
      card: '#FFFFFF',
      primary: '#18181B',
      accent: '#52525B',
      border: '#E4E4E7',
    },
    cssVariables: {
      '--background': '#FAFAFA',
      '--foreground': '#09090B',
      '--card': '#FFFFFF',
      '--card-foreground': '#09090B',
      '--primary': '#18181B',
      '--primary-foreground': '#FAFAFA',
      '--secondary': '#F4F4F5',
      '--secondary-foreground': '#27272A',
      '--accent': '#52525B',
      '--accent-foreground': '#FFFFFF',
      '--border': '#E4E4E7',
      '--muted': '#F4F4F5',
      '--muted-foreground': '#71717A',
      '--input': '#FFFFFF',
      '--input-border': '#D4D4D8',
      '--success': '#15803D',
      '--warning': '#B45309',
      '--danger': '#B91C1C',
      '--shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      '--header-bg': 'rgba(250, 250, 250, 0.95)',
      '--glass-border': 'rgba(228, 228, 231, 0.9)',
    },
  },

  glass: {
    id: 'glass',
    name: 'Glass',
    tagline: 'Translucent frosted glass with vibrant depth',
    isDark: false,
    previewColors: {
      bg: '#F0F4F8',
      card: 'rgba(255, 255, 255, 0.75)',
      primary: '#4338CA',
      accent: '#EC4899',
      border: 'rgba(255, 255, 255, 0.4)',
    },
    cssVariables: {
      '--background': '#F0F4F8',
      '--foreground': '#0F172A',
      '--card': 'rgba(255, 255, 255, 0.72)',
      '--card-foreground': '#0F172A',
      '--primary': '#4338CA',
      '--primary-foreground': '#FFFFFF',
      '--secondary': 'rgba(238, 242, 255, 0.8)',
      '--secondary-foreground': '#312E81',
      '--accent': '#EC4899',
      '--accent-foreground': '#FFFFFF',
      '--border': 'rgba(226, 232, 240, 0.7)',
      '--muted': 'rgba(241, 245, 249, 0.65)',
      '--muted-foreground': '#475569',
      '--input': 'rgba(255, 255, 255, 0.65)',
      '--input-border': 'rgba(203, 213, 225, 0.7)',
      '--success': '#10B981',
      '--warning': '#F59E0B',
      '--danger': '#EF4444',
      '--shadow': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
      '--header-bg': 'rgba(255, 255, 255, 0.65)',
      '--glass-border': 'rgba(255, 255, 255, 0.5)',
    },
  },
};

export const THEME_ORDER: ThemeId[] = [
  'default',
  'light',
  'dark',
  'midnight',
  'minimal',
  'glass',
];
