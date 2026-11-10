import React from 'react';
import { Link } from 'react-router-dom';

const handleCardMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
};

function About() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 py-12">
      <div className="mb-10">
        <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">
          ABOUT UNIVERSITYHUB · OPEN STUDENT ARCHIVE
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">
          Preserving student engineering work beyond final viva day.
        </h1>
        <p className="text-base text-zinc-400 max-w-3xl leading-relaxed">
          Every semester, hundreds of final-year capstones, circuit designs, and software prototypes get graded and then disappear onto forgotten USB drives. UniversityHub indexes those reports, source archives, and demos so juniors can learn from real implementations instead of starting from scratch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-4">
            <i className="bi bi-journal-code text-lg"></i>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Complete Deliverables</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Each archived project bundles the full IEEE/departmental PDF report, GitHub repository or ZIP code archive, and recorded demo video in one place.
          </p>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mb-4">
            <i className="bi bi-search text-lg"></i>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Search by Concept or Stack</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Filter by engineering branch and graduation year, or use Smart Match to search across project abstracts by problem statement and hardware/software stack.
          </p>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 mb-4">
            <i className="bi bi-shield-check text-lg"></i>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Faculty Reviewed</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Coordinators verify report completeness and check for duplicate topics before publishing submissions to the campus directory.
          </p>
        </div>
      </div>

      <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Have a completed course or final-year project?</h2>
          <p className="text-sm text-zinc-400">
            Upload your PDF report and repository link in under two minutes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/projects" className="uh-btn-secondary px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-200">
            Browse Directory
          </Link>
          <Link to="/upload" className="uh-btn-primary px-5 py-2.5 rounded-xl text-sm">
            Submit Project
          </Link>
        </div>
      </div>
    </div>
  );
}

export { About };
export default About;
