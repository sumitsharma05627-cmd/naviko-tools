import React, { useState } from 'react';
import {
  ChevronRight,
  Home,
  TrendingUp,
  GraduationCap,
  FileText,
  Calculator,
  HeartPulse,
  Image as ImageIcon,
  Briefcase,
  Grid,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { ToolMeta, ToolCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { DynamicIcon } from './DynamicIcon';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export interface BreadcrumbNavigationProps {
  /**
   * Current tool metadata to dynamically construct the hierarchy (Home > Category > Tool)
   */
  tool?: ToolMeta;
  /**
   * Custom items override if used outside ToolLayout
   */
  items?: BreadcrumbItem[];
  /**
   * Navigation handler
   */
  onNavigate: (path: string) => void;
  /**
   * Whether to display quick share / copy URL action on the right side
   */
  showActions?: boolean;
  /**
   * Optional custom container class name
   */
  className?: string;
}

/**
 * Maps ToolCategory to proper category hub route, display title, and category icon
 */
export const getCategoryHierarchy = (
  category: ToolCategory
): { label: string; path: string; icon: React.ComponentType<{ className?: string }> } => {
  switch (category) {
    case 'finance':
      return {
        label: 'Finance Tools',
        path: '/finance-tools',
        icon: TrendingUp,
      };
    case 'student':
      return {
        label: 'Student Tools',
        path: '/student-tools',
        icon: GraduationCap,
      };
    case 'pdf':
      return {
        label: 'PDF Tools',
        path: '/pdf-tools',
        icon: FileText,
      };
    case 'calculators':
      return {
        label: 'Calculators',
        path: '/calculators',
        icon: Calculator,
      };
    case 'health':
      return {
        label: 'Health Tools',
        path: '/health-tools',
        icon: HeartPulse,
      };
    case 'image':
      return {
        label: 'Image Tools',
        path: '/image-tools',
        icon: ImageIcon,
      };
    case 'career':
      return {
        label: 'Career Tools',
        path: '/career-tools',
        icon: Briefcase,
      };
    case 'other':
    default:
      return {
        label: 'All Tools',
        path: '/tools',
        icon: Grid,
      };
  }
};

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  tool,
  items,
  onNavigate,
  showActions = true,
  className = '',
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Derive dynamic breadcrumb items
  let breadcrumbItems: BreadcrumbItem[] = [];

  if (items && items.length > 0) {
    breadcrumbItems = items;
  } else if (tool) {
    const categoryInfo = getCategoryHierarchy(tool.category);
    const CategoryIcon = categoryInfo.icon;
    
    // Translated or fallback category title
    const categoryLabel = t(`cat.${tool.category}`, categoryInfo.label);
    const toolTitle = t(`${tool.id}.title`, tool.name);

    breadcrumbItems = [
      {
        label: t('nav.home', 'Home'),
        path: '/',
        icon: <Home className="w-3.5 h-3.5" />,
      },
      {
        label: categoryLabel,
        path: categoryInfo.path,
        icon: <CategoryIcon className="w-3.5 h-3.5" />,
      },
      {
        label: toolTitle,
        path: tool.path,
        icon: tool.iconName ? <DynamicIcon name={tool.iconName} className="w-3.5 h-3.5" /> : undefined,
        active: true,
      },
    ];
  }

  const handleCopyLink = async () => {
    try {
      const url = tool ? `https://naviko.in${tool.path}` : window.location.href;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 transition-colors ${className}`}
      id="breadcrumb-navigation-container"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
        {/* Semantic W3C Breadcrumb Nav */}
        <nav
          aria-label="Breadcrumb"
          className="flex-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          <ol
            className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-1.5 sm:gap-2 whitespace-nowrap min-w-0"
            itemScope
            itemType="https://schema.org/BreadcrumbList"
          >
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1 || item.active;
              const isFirst = index === 0;

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="inline-flex items-center gap-1.5 sm:gap-2 shrink-0"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  <meta itemProp="position" content={String(index + 1)} />

                  {index > 0 && (
                    <ChevronRight
                      className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  {isLast ? (
                    <div
                      className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200/70 dark:border-slate-700/70 max-w-[160px] sm:max-w-[260px] md:max-w-md truncate shadow-2xs"
                      aria-current="page"
                    >
                      {item.icon && <span className="shrink-0 text-indigo-600 dark:text-indigo-400">{item.icon}</span>}
                      <span itemProp="name" className="truncate">
                        {item.label}
                      </span>
                      {item.path && <link itemProp="item" href={`https://naviko.in${item.path}`} />}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => item.path && onNavigate(item.path)}
                      className={`inline-flex items-center gap-1.5 py-1 px-1.5 sm:px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-all cursor-pointer font-medium focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isFirst ? 'hover:font-semibold' : ''
                      }`}
                    >
                      {item.icon && <span className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500">{item.icon}</span>}
                      <span itemProp="name" className="hover:underline">
                        {item.label}
                      </span>
                      {item.path && <link itemProp="item" href={`https://naviko.in${item.path}`} />}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Action Controls (Quick Copy Link / Share) */}
        {showActions && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copy direct tool link"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/80 hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/50 border border-slate-200/80 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Share Tool</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
