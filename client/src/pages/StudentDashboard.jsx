import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserProfileData } from '../utils/userHelpers';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from '../components/ProjectCard';

const handleCardMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
};

function StudentDashboard() {
  const { currentUser } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, pending, rejected
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const profileData = getUserProfileData(currentUser);
      setUserProfile(profileData);
      fetchUserProjects(currentUser.uid);
    } else {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const fetchUserProjects = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/user/${uid}`);
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch user projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProjects = () => {
    if (filter === 'all') return projects;
    return projects.filter((project) => project.status === filter);
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: {
        classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        dot: 'bg-emerald-400',
        text: 'Approved'
      },
      pending: {
        classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dot: 'bg-amber-400',
        text: 'Pending Review'
      },
      rejected: {
        classes: 'bg-red-500/15 text-red-300 border-red-500/30',
        dot: 'bg-red-400',
        text: 'Changes Requested'
      }
    };

    const badge = badges[status] || badges.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${badge.classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
        {badge.text}
      </span>
    );
  };

  const stats = {
    total: projects.length,
    approved: projects.filter((p) => p.status === 'approved').length,
    pending: projects.filter((p) => p.status === 'pending').length,
    rejected: projects.filter((p) => p.status === 'rejected').length
  };

  const filteredProjects = getFilteredProjects();

  if (loading) {
    return (
      <div className="max-w-[1380px] mx-auto px-6 py-12">
        <div className="h-8 w-56 bg-carbon-800/80 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="uh-bento-card h-28 animate-pulse bg-carbon-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1.5">
            STUDENT WORKSPACE · SUBMISSIONS
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">My Project Submissions</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Signed in as <span className="text-zinc-200 font-medium">{userProfile?.displayName}</span> ({userProfile?.branch} · {userProfile?.year})
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="uh-btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <i className="bi bi-plus-lg"></i>
          <span>Submit New Project</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Total Submitted</span>
            <span className="text-2xl font-bold text-white font-mono">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <i className="bi bi-folder2-open"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Published in Archive</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.approved}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <i className="bi bi-check2-circle"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Awaiting Faculty Review</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{stats.pending}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <i className="bi bi-clock-history"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Changes Requested</span>
            <span className="text-2xl font-bold text-red-400 font-mono">{stats.rejected}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
            <i className="bi bi-exclamation-octagon"></i>
          </div>
        </div>
      </div>

      {/* Filter Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-8 p-1.5 rounded-2xl bg-carbon-800/80 border border-white/10 w-fit">
        {[
          { key: 'all', label: `All Submissions (${stats.total})` },
          { key: 'approved', label: `Approved (${stats.approved})` },
          { key: 'pending', label: `Pending (${stats.pending})` },
          { key: 'rejected', label: `Changes Requested (${stats.rejected})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === tab.key
                ? 'bg-indigo-500/20 text-white border border-indigo-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="uh-bento-card p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-zinc-400 mx-auto mb-4">
            <i className="bi bi-inbox text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No matching submissions</h3>
          <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
            {filter === 'all'
              ? "You haven't uploaded any projects to the repository yet. Upload your project report and source links to get started."
              : `You currently have no ${filter} project submissions.`}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => navigate('/upload')}
              className="uh-btn-primary px-6 py-2.5 rounded-xl text-sm"
            >
              Upload Your First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                {getStatusBadge(project.status)}
                {project.status === 'rejected' && project.rejectionReason && (
                  <button
                    onClick={() => alert(`Faculty Review Note:\n\n${project.rejectionReason}`)}
                    className="text-xs font-medium text-red-400 hover:text-red-300 underline"
                  >
                    Read Faculty Feedback
                  </button>
                )}
              </div>
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
