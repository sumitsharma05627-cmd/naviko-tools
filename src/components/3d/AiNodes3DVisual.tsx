import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  ArrowRight,
  Bot,
  FileText,
  BarChart3,
  Image,
} from 'lucide-react';

interface AiNodes3DVisualProps {
  onNavigate: (path: string) => void;
}

export const AiNodes3DVisual: React.FC<AiNodes3DVisualProps> = ({ onNavigate }) => {
  const [activeNode, setActiveNode] = useState<string>('resume');

  const nodes = [
    {
      id: 'resume',
      title: 'ATS Resume Architect',
      subtitle: 'Keyword Density & Scoring',
      icon: FileText,
      path: '/tools/resume-builder',
      color: 'text-indigo-400',
      tag: 'Client-Side AI',
      desc: 'Parses job requirements, structures clean LaTeX-grade layouts, and optimizes ATS keyword compliance.',
    },
    {
      id: 'study',
      title: 'Study Feasibility Matrix',
      subtitle: 'Workload & Syllabus Projections',
      icon: Brain,
      path: '/tools/study-decision-planner',
      color: 'text-purple-400',
      tag: 'Velocity Algorithm',
      desc: 'Determines target exam feasibility by computing chapter workloads, revision buffers, and daily study capacity.',
    },
    {
      id: 'mock',
      title: 'Mock Test Analyzer',
      subtitle: 'Score Momentum Diagnostics',
      icon: BarChart3,
      path: '/tools/mock-test-analyzer',
      color: 'text-emerald-400',
      tag: 'Score Intelligence',
      desc: 'Detects subject weak spots, score plateaus, and projects final exam percentiles across testing rounds.',
    },
    {
      id: 'vision',
      title: 'Edge Background Remover',
      subtitle: 'In-Browser Visual Processing',
      icon: Image,
      path: '/tools/background-remover',
      color: 'text-teal-400',
      tag: 'Local Vision',
      desc: 'Zero-cloud image segmentation isolating portraits and signatures with feathered transparent alpha output.',
    },
  ];

  return (
    <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-950 p-6 sm:p-10 border border-purple-500/30 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Ambient Neural Glow */}
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7 0%, #6366f1 70%, transparent)' }}
          aria-hidden="true"
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold mb-3">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Smart Neural Workspace</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Intelligent Study &amp; Productivity Algorithms
              </h2>
              <p className="mt-2 text-sm text-slate-300 max-w-2xl">
                Advanced mathematical models and client-side processing pipelines built for career progression, exam preparation, and instant document workflow.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/tools')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore All Smart Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive 3D Nodes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodes.map((node) => {
              const Icon = node.icon;
              const isActive = activeNode === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => {
                    setActiveNode(node.id);
                    onNavigate(node.path);
                  }}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer group flex flex-col justify-between ${
                    isActive
                      ? 'bg-white/15 border-purple-400/60 shadow-lg shadow-purple-500/10 -translate-y-1'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-white/10 ${node.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {node.tag}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {node.title}
                    </h3>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {node.subtitle}
                    </div>

                    <p className="text-xs text-slate-300/80 mt-2.5 leading-relaxed">
                      {node.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
                    <span>Launch Utility</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
