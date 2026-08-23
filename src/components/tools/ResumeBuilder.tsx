import React, { useState, useEffect } from 'react';
import { 
  User, Briefcase, GraduationCap, Code, FolderGit2, Award, 
  Globe, Plus, Trash2, Printer, Download, Sparkles, RotateCcw, 
  Eye, Layout, FileText, Check, ShieldCheck 
} from 'lucide-react';

interface ResumeData {
  personal: {
    fullName: string;
    headline: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
  };
  summary: string;
  skills: string[];
  experience: {
    id: string;
    role: string;
    company: string;
    location: string;
    duration: string;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    location: string;
    year: string;
    score: string;
  }[];
  projects: {
    id: string;
    title: string;
    tech: string;
    description: string;
  }[];
  certifications: string[];
  languages: string[];
}

const SAMPLE_RESUME: ResumeData = {
  personal: {
    fullName: 'Alex Morgan',
    headline: 'Full-Stack Software Engineer & Solutions Architect',
    email: 'alex.morgan@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'linkedin.com/in/alexmorgan',
  },
  summary:
    'Dedicated Full-Stack Software Engineer with 4+ years of hands-on experience building high-performance web applications, resilient RESTful APIs, and scalable cloud architectures. Proven track record of improving application throughput and optimizing client-side performance.',
  skills: [
    'React.js', 'TypeScript', 'Node.js', 'Tailwind CSS', 'Next.js', 
    'PostgreSQL', 'Docker', 'AWS Cloud', 'REST & GraphQL APIs', 'Git'
  ],
  experience: [
    {
      id: '1',
      role: 'Senior Frontend Developer',
      company: 'Apex Tech Solutions',
      location: 'San Francisco, CA',
      duration: '2023 - Present',
      description:
        '• Architected and shipped 4 core SaaS modules in React and TypeScript, boosting customer engagement by 35%.\n• Reduced frontend bundle size by 40% through code-splitting and asset optimization.\n• Mentored a team of 5 junior developers on unit testing, TypeScript best practices, and code reviews.'
    },
    {
      id: '2',
      role: 'Software Developer',
      company: 'CloudMatrix Innovations',
      location: 'Austin, TX',
      duration: '2021 - 2023',
      description:
        '• Built RESTful API microservices supporting 100k+ daily active users.\n• Implemented automated CI/CD deployment pipelines using GitHub Actions and Docker containers.\n• Collaborated with UX designers to improve core web vitals score from 65 to 98.'
    }
  ],
  education: [
    {
      id: '1',
      degree: 'B.S. in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      year: '2017 - 2021',
      score: '3.85 GPA / Magna Cum Laude'
    }
  ],
  projects: [
    {
      id: '1',
      title: 'Real-Time Collaboration Canvas',
      tech: 'React, WebSockets, Canvas API, TypeScript',
      description: 'Engineered a low-latency collaborative whiteboard allowing up to 50 concurrent users to sketch and export diagrams in real time.'
    },
    {
      id: '2',
      title: 'Automated Code Reviewer Bot',
      tech: 'Node.js, GitHub API, OpenAI, Docker',
      description: 'Created a developer CLI tool that automatically audits pull requests for security flaws, syntax defects, and styling consistency.'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect – Associate',
    'Meta Certified Front-End Developer Professional'
  ],
  languages: ['English (Fluent)', 'Spanish (Conversational)']
};

const EMPTY_RESUME: ResumeData = {
  personal: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
  },
  summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: []
};

type TemplateType = 'modern' | 'classic' | 'minimal';

export const ResumeBuilder: React.FC = () => {
  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('naviko_resume_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return SAMPLE_RESUME;
      }
    }
    return SAMPLE_RESUME;
  });

  const [template, setTemplate] = useState<TemplateType>('modern');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [skillInput, setSkillInput] = useState<string>('');
  const [certInput, setCertInput] = useState<string>('');
  const [langInput, setLangInput] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('naviko_resume_data', JSON.stringify(resume));
  }, [resume]);

  const loadSample = () => {
    setResume(SAMPLE_RESUME);
  };

  const handleClear = () => {
    if (confirm('Clear all resume information?')) {
      setResume(EMPTY_RESUME);
    }
  };

  const printResume = () => {
    window.print();
  };

  // Helper additions
  const addExperience = () => {
    setResume({
      ...resume,
      experience: [
        ...resume.experience,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: '',
          company: '',
          location: '',
          duration: '',
          description: ''
        }
      ]
    });
  };

  const removeExperience = (id: string) => {
    setResume({
      ...resume,
      experience: resume.experience.filter((e) => e.id !== id)
    });
  };

  const addEducation = () => {
    setResume({
      ...resume,
      education: [
        ...resume.education,
        {
          id: Math.random().toString(36).substring(2, 9),
          degree: '',
          school: '',
          location: '',
          year: '',
          score: ''
        }
      ]
    });
  };

  const removeEducation = (id: string) => {
    setResume({
      ...resume,
      education: resume.education.filter((e) => e.id !== id)
    });
  };

  const addProject = () => {
    setResume({
      ...resume,
      projects: [
        ...resume.projects,
        {
          id: Math.random().toString(36).substring(2, 9),
          title: '',
          tech: '',
          description: ''
        }
      ]
    });
  };

  const removeProject = (id: string) => {
    setResume({
      ...resume,
      projects: resume.projects.filter((p) => p.id !== id)
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !resume.skills.includes(skillInput.trim())) {
      setResume({ ...resume, skills: [...resume.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setResume({ ...resume, skills: resume.skills.filter((s) => s !== skill) });
  };

  const addCert = () => {
    if (certInput.trim()) {
      setResume({ ...resume, certifications: [...resume.certifications, certInput.trim()] });
      setCertInput('');
    }
  };

  const removeCert = (idx: number) => {
    setResume({
      ...resume,
      certifications: resume.certifications.filter((_, i) => i !== idx)
    });
  };

  const addLang = () => {
    if (langInput.trim()) {
      setResume({ ...resume, languages: [...resume.languages, langInput.trim()] });
      setLangInput('');
    }
  };

  const removeLang = (idx: number) => {
    setResume({
      ...resume,
      languages: resume.languages.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Template:
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                template === 'modern'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              Modern Slate
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                template === 'classic'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              Executive Classic
            </button>
            <button
              onClick={() => setTemplate('minimal')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                template === 'minimal'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              Clean Minimal
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadSample}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-indigo-700 rounded-xl border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Load Sample
          </button>

          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </button>

          <button
            onClick={printResume}
            className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Main Grid: Form Editor vs Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <div className="xl:col-span-6 space-y-6 no-print">
          {/* Personal Info */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              1. Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={resume.personal.fullName}
                  onChange={(e) => setResume({ ...resume, personal: { ...resume.personal, fullName: e.target.value } })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={resume.personal.headline}
                  onChange={(e) => setResume({ ...resume, personal: { ...resume.personal, headline: e.target.value } })}
                  placeholder="e.g. Software Engineer"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={resume.personal.email}
                  onChange={(e) => setResume({ ...resume, personal: { ...resume.personal, email: e.target.value } })}
                  placeholder="alex@email.com"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={resume.personal.phone}
                  onChange={(e) => setResume({ ...resume, personal: { ...resume.personal, phone: e.target.value } })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Location</label>
                <input
                  type="text"
                  value={resume.personal.location}
                  onChange={(e) => setResume({ ...resume, personal: { ...resume.personal, location: e.target.value } })}
                  placeholder="City, State / Country"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">LinkedIn / Portfolio URL</label>
                <input
                  type="text"
                  value={resume.personal.linkedin}
                  onChange={(e) => setResume({ ...resume, personal: { ...resume.personal, linkedin: e.target.value } })}
                  placeholder="linkedin.com/in/username"
                  className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              2. Professional Summary
            </h3>
            <textarea
              rows={3}
              value={resume.summary}
              onChange={(e) => setResume({ ...resume, summary: e.target.value })}
              placeholder="Brief 2-3 sentence overview of your domain background, core competencies, and career focus..."
              className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Skills */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-indigo-600" />
              3. Core Skills &amp; Tools
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter (e.g. React, Python)"
                className="w-full text-xs font-medium px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
              />
              <button
                onClick={addSkill}
                className="px-3.5 py-2 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg shrink-0"
              >
                Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {resume.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-800"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-slate-400 hover:text-rose-600">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                4. Professional Experience
              </h3>
              <button
                onClick={addExperience}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Job
              </button>
            </div>

            {resume.experience.map((exp, idx) => (
              <div key={exp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Position #{idx + 1}</span>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    aria-label="Remove role"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = resume.experience.map((x) => (x.id === exp.id ? { ...x, role: e.target.value } : x));
                      setResume({ ...resume, experience: updated });
                    }}
                    placeholder="Job Title (e.g. Lead Engineer)"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = resume.experience.map((x) => (x.id === exp.id ? { ...x, company: e.target.value } : x));
                      setResume({ ...resume, experience: updated });
                    }}
                    placeholder="Company Name"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => {
                      const updated = resume.experience.map((x) => (x.id === exp.id ? { ...x, duration: e.target.value } : x));
                      setResume({ ...resume, experience: updated });
                    }}
                    placeholder="Duration (e.g. 2022 - Present)"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => {
                      const updated = resume.experience.map((x) => (x.id === exp.id ? { ...x, location: e.target.value } : x));
                      setResume({ ...resume, experience: updated });
                    }}
                    placeholder="Location / Remote"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                </div>
                <textarea
                  rows={3}
                  value={exp.description}
                  onChange={(e) => {
                    const updated = resume.experience.map((x) => (x.id === exp.id ? { ...x, description: e.target.value } : x));
                    setResume({ ...resume, experience: updated });
                  }}
                  placeholder="Key accomplishments and impact bullet points (start each line with •)"
                  className="w-full text-xs font-medium p-2 bg-white border border-slate-200 rounded-md outline-none"
                />
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                5. Education
              </h3>
              <button
                onClick={addEducation}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Degree
              </button>
            </div>

            {resume.education.map((edu) => (
              <div key={edu.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Degree Entry</span>
                  <button onClick={() => removeEducation(edu.id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = resume.education.map((x) => (x.id === edu.id ? { ...x, degree: e.target.value } : x));
                      setResume({ ...resume, education: updated });
                    }}
                    placeholder="Degree (e.g. B.Tech Computer Science)"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => {
                      const updated = resume.education.map((x) => (x.id === edu.id ? { ...x, school: e.target.value } : x));
                      setResume({ ...resume, education: updated });
                    }}
                    placeholder="University / College"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => {
                      const updated = resume.education.map((x) => (x.id === edu.id ? { ...x, year: e.target.value } : x));
                      setResume({ ...resume, education: updated });
                    }}
                    placeholder="Years (e.g. 2020 - 2024)"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                  <input
                    type="text"
                    value={edu.score}
                    onChange={(e) => {
                      const updated = resume.education.map((x) => (x.id === edu.id ? { ...x, score: e.target.value } : x));
                      setResume({ ...resume, education: updated });
                    }}
                    placeholder="CGPA / Score (e.g. 8.8 CGPA)"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600" />
                6. Notable Projects
              </h3>
              <button
                onClick={addProject}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {resume.projects.map((proj) => (
              <div key={proj.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Project Entry</span>
                  <button onClick={() => removeProject(proj.id)} className="text-slate-400 hover:text-rose-600 p-1">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={proj.title}
                    onChange={(e) => {
                      const updated = resume.projects.map((x) => (x.id === proj.id ? { ...x, title: e.target.value } : x));
                      setResume({ ...resume, projects: updated });
                    }}
                    placeholder="Project Title"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                  <input
                    type="text"
                    value={proj.tech}
                    onChange={(e) => {
                      const updated = resume.projects.map((x) => (x.id === proj.id ? { ...x, tech: e.target.value } : x));
                      setResume({ ...resume, projects: updated });
                    }}
                    placeholder="Tech Stack Used (e.g. React, Node)"
                    className="w-full text-xs font-medium px-2.5 py-1.5 bg-white border border-slate-200 rounded-md outline-none"
                  />
                </div>
                <textarea
                  rows={2}
                  value={proj.description}
                  onChange={(e) => {
                    const updated = resume.projects.map((x) => (x.id === proj.id ? { ...x, description: e.target.value } : x));
                    setResume({ ...resume, projects: updated });
                  }}
                  placeholder="Key features, problem solved, and measurable outcomes..."
                  className="w-full text-xs font-medium p-2 bg-white border border-slate-200 rounded-md outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Printable Resume Preview */}
        <div className="xl:col-span-6 sticky top-20">
          <div className="flex items-center justify-between mb-3 no-print">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-indigo-600" />
              Live A4 ATS Preview
            </div>
            <div className="text-xs text-slate-500 font-medium">
              100% Client-Side Private • ATS Optimized
            </div>
          </div>

          {/* The Printable A4 Container */}
          <div
            id="resume-printable-area"
            className={`w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-10 text-slate-900 transition-all ${
              template === 'classic'
                ? 'font-serif'
                : 'font-sans'
            }`}
            style={{ minHeight: '840px' }}
          >
            {/* Header / Contact */}
            <div className={`pb-4 mb-4 border-b ${template === 'modern' ? 'border-indigo-600 border-b-2' : 'border-slate-300'}`}>
              <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${template === 'modern' ? 'text-indigo-950' : 'text-slate-900'}`}>
                {resume.personal.fullName || 'Your Full Name'}
              </h1>
              {resume.personal.headline && (
                <div className="text-sm font-semibold text-slate-700 mt-1">
                  {resume.personal.headline}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2.5">
                {resume.personal.email && <span>{resume.personal.email}</span>}
                {resume.personal.phone && <span>• {resume.personal.phone}</span>}
                {resume.personal.location && <span>• {resume.personal.location}</span>}
                {resume.personal.linkedin && <span>• {resume.personal.linkedin}</span>}
                {resume.personal.website && <span>• {resume.personal.website}</span>}
              </div>
            </div>

            {/* Summary */}
            {resume.summary && (
              <div className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${template === 'modern' ? 'text-indigo-900' : 'text-slate-900'}`}>
                  Professional Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {resume.summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {resume.skills.length > 0 && (
              <div className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${template === 'modern' ? 'text-indigo-900' : 'text-slate-900'}`}>
                  Core Skills &amp; Competencies
                </h2>
                <div className="text-xs text-slate-800 leading-relaxed font-medium">
                  {resume.skills.join(' • ')}
                </div>
              </div>
            )}

            {/* Experience */}
            {resume.experience.length > 0 && (
              <div className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200 ${template === 'modern' ? 'text-indigo-900' : 'text-slate-900'}`}>
                  Professional Experience
                </h2>
                <div className="space-y-3.5">
                  {resume.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                        <span>{exp.role} <span className="font-normal text-slate-600">at</span> {exp.company}</span>
                        <span className="text-slate-500 font-normal">{exp.duration}</span>
                      </div>
                      {exp.location && (
                        <div className="text-[11px] text-slate-500 italic mb-1">{exp.location}</div>
                      )}
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1">
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resume.education.length > 0 && (
              <div className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200 ${template === 'modern' ? 'text-indigo-900' : 'text-slate-900'}`}>
                  Education
                </h2>
                <div className="space-y-2.5">
                  {resume.education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between items-baseline font-bold text-slate-900">
                        <span>{edu.degree} — {edu.school}</span>
                        <span className="text-slate-500 font-normal">{edu.year}</span>
                      </div>
                      {edu.score && (
                        <div className="text-[11px] text-indigo-800 font-medium">{edu.score}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resume.projects.length > 0 && (
              <div className="mb-5">
                <h2 className={`text-xs font-bold uppercase tracking-wider mb-2.5 pb-1 border-b border-slate-200 ${template === 'modern' ? 'text-indigo-900' : 'text-slate-900'}`}>
                  Projects
                </h2>
                <div className="space-y-2.5">
                  {resume.projects.map((proj) => (
                    <div key={proj.id} className="text-xs">
                      <div className="font-bold text-slate-900">
                        {proj.title} {proj.tech && <span className="font-normal text-slate-500">({proj.tech})</span>}
                      </div>
                      <p className="text-slate-700 leading-relaxed mt-0.5">
                        {proj.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications & Languages */}
            {(resume.certifications.length > 0 || resume.languages.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                {resume.certifications.length > 0 && (
                  <div>
                    <h3 className="font-bold uppercase text-[11px] text-slate-900 mb-1">
                      Certifications
                    </h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                      {resume.certifications.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {resume.languages.length > 0 && (
                  <div>
                    <h3 className="font-bold uppercase text-[11px] text-slate-900 mb-1">
                      Languages
                    </h3>
                    <div className="text-slate-700">
                      {resume.languages.join(' • ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
