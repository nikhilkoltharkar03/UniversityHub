import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

const FALLBACK_PROJECTS = [
  {
    _id: 'fallback-1',
    title: 'Autonomous Solar-Powered Quadcopter for Campus Surveillance',
    branch: 'MECH',
    year: '4th Year',
    studentName: 'Vikram Singh',
    views: 76,
    status: 'approved',
    description:
      'Lightweight quadcopter drone designed with auxiliary solar charging panels, brushless motors, and a ROS flight controller with OpenCV obstacle detection.',
    techStack: ['C++', 'ROS', 'Python', 'OpenCV', 'SolidWorks'],
    videoUrl: 'demo',
    zipUrl: 'source',
  },
  {
    _id: 'fallback-2',
    title: 'AI-Powered Smart Campus 3D Navigation System',
    branch: 'CSE',
    year: '4th Year',
    studentName: 'Rahul Sharma',
    views: 142,
    status: 'approved',
    description:
      'Interactive 3D web application allowing students and visitors to navigate campus buildings, labs, and wheelchair-accessible indoor pathways.',
    techStack: ['React', 'Three.js', 'Node.js', 'MongoDB', 'Python'],
    videoUrl: 'demo',
    githubLink: 'https://github.com',
  },
  {
    _id: 'fallback-3',
    title: 'Blockchain Academic Credential Verification',
    branch: 'IT',
    year: '4th Year',
    studentName: 'Aman Verma',
    views: 215,
    status: 'approved',
    description:
      'Decentralized Ethereum smart contract system to issue, sign, and verify tamper-proof university degrees and semester marksheets via IPFS.',
    techStack: ['Solidity', 'React', 'Ethers.js', 'IPFS', 'Hardhat'],
    zipUrl: 'source',
    githubLink: 'https://github.com',
  },
];

function Home() {
  const [projects, setProjects] = useState([]);
  const [selectedStageBranch, setSelectedStageBranch] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      const data = response.data?.data || [];
      setProjects(data.length > 0 ? data : FALLBACK_PROJECTS);
    } catch (error) {
      setProjects(FALLBACK_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  const handleBentoMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const displayedProjects = (
    selectedStageBranch === 'All'
      ? projects
      : projects.filter(
          (p) => (p.branch || '').toUpperCase() === selectedStageBranch
        )
  ).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 w-full">
      {/* Editorial Hero */}
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/25 text-sky-200 text-xs font-medium mb-6 shadow-[0_0_20px_rgba(56,189,248,0.12)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>2025–2026 Academic Repository · 5 Engineering Departments</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
          The central archive for{' '}
          <span className="bg-gradient-to-r from-sky-300 via-white to-emerald-300 bg-clip-text text-transparent">
            student engineering
          </span>{' '}
          projects.
        </h1>

        <p className="text-base sm:text-lg text-slate-300/90 mt-5 leading-relaxed max-w-2xl mx-auto font-normal">
          Browse final-year capstones, read technical reports, test working
          demos, and build on past research submitted by students across every
          branch.
        </p>

        {/* Dual Hero CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link to="/projects" className="uh-btn-primary px-6 py-3 text-sm">
            <span>Browse Projects</span>
            <svg
              className="w-4 h-4 arrow-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
          <Link to="/upload" className="uh-btn-secondary px-6 py-3 text-sm">
            <span>Submit Your Project</span>
          </Link>
        </div>
      </div>

      {/* Interactive Department Spotlight Stage */}
      <div className="mt-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 m-0">
              <span>Featured Student Submissions</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                Interactive Preview
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-0">
              Click any project card to inspect its PDF report, system diagram,
              and live sandbox runner.
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-[#10121A]/90 border border-white/[0.1] self-start shadow-inner">
            {[
              { id: 'All', label: 'All Branches' },
              { id: 'CSE', label: 'CSE' },
              { id: 'ECE', label: 'ECE' },
              { id: 'MECH', label: 'Mechanical' },
              { id: 'IT', label: 'IT' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStageBranch(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs transition-all ${
                  selectedStageBranch === tab.id
                    ? 'font-semibold bg-sky-400 text-[#07080C] shadow-sm'
                    : 'font-medium text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Featured Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="uh-bento-card h-80 animate-pulse bg-white/[0.03]"
              />
            ))}
          </div>
        ) : displayedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        ) : (
          <div className="uh-bento-card p-10 text-center">
            <p className="text-sm text-slate-300 mb-3">
              No projects in {selectedStageBranch} yet.
            </p>
            <button
              onClick={() => setSelectedStageBranch('All')}
              className="uh-btn-secondary text-xs"
            >
              Show All Branches
            </button>
          </div>
        )}
      </div>

      {/* 21st.dev Asymmetric 4-Tile Bento Grid */}
      <div className="mt-20">
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-wider text-sky-400">
            Built for Students & Faculty
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Everything needed to document and verify student work.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Tile 1 (Span 2 Cols) */}
          <div
            onMouseMove={handleBentoMouseMove}
            className="md:col-span-2 uh-bento-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-1 rounded-md mb-4">
                <span>Automatic Report Parser</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Drop your project report PDF—we extract the tech stack.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed mb-0">
                When students upload their final PDF documentation, UniversityHub
                scans the report to suggest technologies, domain tags, and
                abstract summaries automatically.
              </p>
            </div>

            <div className="relative z-10 mt-6 p-4 rounded-xl bg-[#07080C]/90 border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-300 font-mono text-xs font-bold">
                  PDF
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Quadcopter_Final_Report.pdf
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    4.2 MB · 48 Pages · Parsed in 1.8s
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  + ROS
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  + OpenCV
                </span>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  + C++
                </span>
              </div>
            </div>
          </div>

          {/* Bento Tile 2 (Span 1 Col) */}
          <div
            onMouseMove={handleBentoMouseMove}
            className="uh-bento-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-300 bg-sky-500/15 border border-sky-400/30 px-2.5 py-1 rounded-md mb-4">
                <span>Originality Check</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Prevent duplicate submissions across batches.
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed mb-0">
                Every new upload is compared against past seniors&apos; projects
                by title, abstract meaning, and code structure before faculty
                approval.
              </p>
            </div>

            <div className="relative z-10 mt-6 p-3.5 rounded-xl bg-[#07080C]/90 border border-white/[0.08]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300">Archive Overlap</span>
                <span className="font-mono font-semibold text-emerald-400">
                  3.2% (Unique)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-sky-400 h-full rounded-full"
                  style={{ width: '12%' }}
                />
              </div>
            </div>
          </div>

          {/* Bento Tile 3 (Span 1 Col) */}
          <div
            onMouseMove={handleBentoMouseMove}
            className="uh-bento-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-indigo-300 bg-indigo-500/15 border border-indigo-400/30 px-2.5 py-1 rounded-md mb-4">
                <span>Complete Deliverables</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                PDF Report, Video Demo & Source ZIP in one place.
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed mb-0">
                No more broken Google Drive links. Store the project report,
                working video demonstration, source archive, and GitHub link
                together.
              </p>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
              <div className="p-2.5 rounded-lg bg-[#07080C]/90 border border-rose-500/25 text-rose-300">
                Report.pdf
              </div>
              <div className="p-2.5 rounded-lg bg-[#07080C]/90 border border-sky-500/25 text-sky-300">
                Demo.mp4
              </div>
              <div className="p-2.5 rounded-lg bg-[#07080C]/90 border border-amber-500/25 text-amber-300">
                Source.zip
              </div>
            </div>
          </div>

          {/* Bento Tile 4 (Span 2 Cols) */}
          <div
            onMouseMove={handleBentoMouseMove}
            className="md:col-span-2 uh-bento-card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-300 bg-sky-500/15 border border-sky-400/30 px-2.5 py-1 rounded-md mb-4">
                <span>Smart Concept Search</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Search by exact technology or describe what you want to build.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed mb-0">
                Filter by branch (CSE, ECE, MECH, IT), academic year, or switch
                on Smart Match to find projects by concept—even if they use
                different keywords.
              </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[#07080C]/90 border border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs text-slate-200 font-mono">
                <span className="text-sky-400">Query:</span>
                <span>&quot;projects for wheelchair accessible navigation&quot;</span>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300"
              >
                Try in Directory →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
