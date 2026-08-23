export type ToolCategory = 
  | 'calculators' 
  | 'finance'
  | 'student' 
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
