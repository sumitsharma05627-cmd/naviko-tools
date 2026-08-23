import React, { useEffect } from 'react';
import { ChevronRight, Home, BookOpen, Clock, Calendar, ArrowLeft, Lightbulb } from 'lucide-react';
import { BlogPost } from '../types';
import { BLOG_POSTS } from '../data/blogData';
import { DesktopAdSlot, MobileAdSlot } from '../components/AdSlot';

interface BlogPostDetailProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export const BlogPostDetail: React.FC<BlogPostDetailProps> = ({ slug, onNavigate }) => {
  const post = BLOG_POSTS.find((p) => p.slug === slug) || BLOG_POSTS[0];

  useEffect(() => {
    document.title = `${post.title} — NAVIKO Blog`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [post]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200/80 py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center text-xs text-slate-500 space-x-2">
            <button onClick={() => onNavigate('/')} className="hover:text-indigo-600">Home</button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <button onClick={() => onNavigate('/blog')} className="hover:text-indigo-600">Blog</button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-800 font-semibold truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button
          onClick={() => onNavigate('/blog')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 mb-6 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Articles
        </button>

        {/* Article Header */}
        <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
          <header className="border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3 text-xs font-semibold text-indigo-600 mb-3">
              <span className="bg-indigo-50 px-3 py-1 rounded-full">{post.category}</span>
              <span className="text-slate-400">•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">{post.publishedDate}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="mt-3 text-base text-slate-600 leading-relaxed font-medium">
              {post.description}
            </p>
          </header>

          {/* Article Sections */}
          <div className="space-y-8 text-slate-800 leading-relaxed">
            {post.content.map((sec, idx) => (
              <section key={idx} className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  {sec.heading}
                </h2>
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx} className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {p}
                  </p>
                ))}

                {sec.formula && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl font-mono text-xs sm:text-sm text-indigo-900 font-bold">
                    Formula: {sec.formula}
                  </div>
                )}

                {sec.tips && sec.tips.length > 0 && (
                  <div className="p-5 bg-amber-50/70 border border-amber-200/70 rounded-2xl space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Key Insights &amp; Tips
                    </div>
                    <ul className="list-disc list-inside text-xs sm:text-sm text-amber-900 space-y-1">
                      {sec.tips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              NAVIKO Educational Reference Suite
            </span>
            <button
              onClick={() => onNavigate('/tools')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Try Working Calculators →
            </button>
          </div>
        </article>

        {/* AdSlot */}
        <DesktopAdSlot className="mt-8" />
        <MobileAdSlot className="mt-6" />
      </div>
    </div>
  );
};
