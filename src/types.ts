export type ToolCategory = 
  | 'calculators' 
  | 'finance'
  | 'student' 
  | 'health'
  | 'image' 
  | 'pdf' 
  | 'career' 
  | 'other';

export interface ToolMeta {
  id: string;
  name: string;
  slug: string;
  path: string;
  category: ToolCategory;
  categoryName: string;
  description: string;
  shortDescription: string;
  iconName: string;
  popular?: boolean;
  studentHub?: boolean;
  status: 'active' | 'coming_soon';
  tags: string[];
  features?: string[];
  faqs?: { question: string; answer: string }[];
  howToUse?: string[];
  seoTitle?: string;
  metaDescription?: string;
  relatedToolPaths?: string[];
  // AI SEO / GEO / AEO structured knowledge fields
  whatItIs?: string;
  whatItDoes?: string;
  whoItIsFor?: string[];
  howItWorks?: string;
  resultsMeaning?: string;
  limitations?: string[];
  formula?: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
  publishedDate: string;
  content: {
    heading: string;
    body: string[];
    formula?: string;
    tips?: string[];
  }[];
}
