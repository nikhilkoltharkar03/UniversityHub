import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Smart Match (Semantic search) state
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [semanticSearching, setSemanticSearching] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedTech, setSelectedTech] = useState('');

  // Unique values for filters
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [techStacks, setTechStacks] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    projects,
    searchTerm,
    selectedBranch,
    selectedYear,
    selectedTech,
    useSemanticSearch,
  ]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      const projectsData = response.data?.data || [];
      setProjects(projectsData);
      setFilteredProjects(projectsData);
      extractFilterOptions(projectsData);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Unable to reach the project archive server. Please ensure the backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const extractFilterOptions = (projectsData) => {
    const uniqueBranches = [
      ...new Set(projectsData.map((p) => p.branch).filter(Boolean)),
    ].sort();
    setBranches(uniqueBranches);

    const uniqueYears = [
      ...new Set(projectsData.map((p) => p.year).filter(Boolean)),
    ].sort();
    setYears(uniqueYears);

    const allTech = projectsData.flatMap((p) => p.techStack || []);
    const uniqueTech = [...new Set(allTech.filter(Boolean))].sort();
    setTechStacks(uniqueTech);
  };

  const applyFilters = async () => {
    if (useSemanticSearch && searchTerm.trim()) {
      await performSemanticSearch();
      return;
    }

    let filtered = [...projects];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (project) =>
          (project.title || '').toLowerCase().includes(search) ||
          (project.description || '').toLowerCase().includes(search) ||
          (project.studentName || '').toLowerCase().includes(search) ||
          (project.tags || []).some((tag) =>
            tag.toLowerCase().includes(search)
          ) ||
          (project.techStack || []).some((tech) =>
            tech.toLowerCase().includes(search)
          )
      );
    }

    if (selectedBranch) {
      filtered = filtered.filter((project) => project.branch === selectedBranch);
    }

    if (selectedYear) {
      filtered = filtered.filter((project) => project.year === selectedYear);
    }

    if (selectedTech) {
      filtered = filtered.filter((project) =>
        (project.techStack || []).includes(selectedTech)
      );
    }

    setFilteredProjects(filtered);
  };

  const performSemanticSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    setSemanticSearching(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/projects/semantic-search',
        {
          query: searchTerm,
          filters: {
            branch: selectedBranch || undefined,
            year: selectedYear || undefined,
            techStack: selectedTech || undefined,
          },
          useHybrid: false,
        }
      );

      setFilteredProjects(response.data?.data || []);
    } catch (err) {
      console.error('Semantic search failed:', err);
      setUseSemanticSearch(false);
    } finally {
      setSemanticSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedBranch('');
    setSelectedYear('');
    setSelectedTech('');
  };

  const hasActiveFilters =
    searchTerm || selectedBranch || selectedYear || selectedTech;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full">
      {/* Directory Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
            Project Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
            Showing{' '}
            <span className="text-sky-400 font-semibold">
              {filteredProjects.length}
            </span>{' '}
            of {projects.length} approved student projects across engineering
            departments.
          </p>
        </div>

        <Link to="/upload" className="uh-btn-primary self-start md:self-auto">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Submit New Project</span>
        </Link>
      </div>

      {/* Unified Filter Bar (Search + Uiverse Smart Match Toggle + Branch/Year/Tech Dropdowns) */}
      <div className="uh-bento-card p-4 mb-7">
        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-sky-400 absolute left-3.5 top-3 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                useSemanticSearch
                  ? 'Describe a concept (e.g. "wheelchair navigation" or "saving water on farms")...'
                  : 'Search by title, technology (React, ROS, Solidity), or student name...'
              }
              className="w-full bg-[#07080C]/90 text-xs text-white placeholder-slate-500 rounded-xl pl-10 pr-8 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Uiverse Smart Match Toggle */}
          <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#07080C]/90 border border-white/[0.1] cursor-pointer select-none shrink-0 m-0">
            <div className="uh-uiverse-toggle">
              <input
                type="checkbox"
                checked={useSemanticSearch}
                onChange={(e) => setUseSemanticSearch(e.target.checked)}
              />
              <span className="uh-uiverse-track"></span>
            </div>
            <div>
              <span
                className={`text-xs font-semibold block leading-none ${useSemanticSearch ? 'text-sky-400' : 'text-slate-200'
                  }`}
              >
                Smart Match
              </span>
              <span className="text-[10px] text-slate-400">
                {semanticSearching ? 'Searching...' : 'Concept search'}
              </span>
            </div>
          </label>

          {/* Branch Select */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-[#07080C]/90 text-xs text-slate-200 rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Academic Year Select */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-[#07080C]/90 text-xs text-slate-200 rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Tech Stack Select */}
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="bg-[#07080C]/90 text-xs text-slate-200 rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
          >
            <option value="">All Technologies</option>
            {techStacks.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="uh-btn-secondary py-2 px-3.5 text-xs"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="uh-bento-card p-4 mb-6 border-rose-500/30 bg-rose-500/10 text-xs text-rose-200 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchProjects}
            className="uh-btn-secondary py-1 px-3 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="uh-bento-card h-80 animate-pulse bg-white/[0.03]"
            />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="uh-bento-card p-14 text-center max-w-lg mx-auto my-8">
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mx-auto text-slate-400 mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">
              No matching projects found
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Try adjusting your search keywords or clearing the active branch
              and technology filters.
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="uh-btn-primary text-xs">
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
