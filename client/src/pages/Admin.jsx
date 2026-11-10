import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const handleCardMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
};

function Admin() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filter, setFilter] = useState('pending');

  // Plagiarism state
  const [plagiarismModal, setPlagiarismModal] = useState(null);
  const [plagiarismLoading, setPlagiarismLoading] = useState(false);
  const [plagiarismData, setPlagiarismData] = useState(null);
  const [plagiarismScores, setPlagiarismScores] = useState({});

  useEffect(() => {
    if (!currentUser || currentUser.email !== 'admin@universityhub.com') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    fetchStats();
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { 'admin-email': 'admin@universityhub.com' }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let endpoint = 'http://localhost:5000/api/admin/projects/all';
      if (filter !== 'all') {
        endpoint += `?status=${filter}`;
      }
      const response = await axios.get(endpoint, {
        headers: { 'admin-email': 'admin@universityhub.com' }
      });
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setMessage({ type: 'error', text: 'Failed to load projects from server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/projects/${projectId}/approve`,
        { adminEmail: currentUser.email },
        { headers: { 'admin-email': 'admin@universityhub.com' } }
      );
      setMessage({ type: 'success', text: 'Project approved and published to the archive.' });
      fetchProjects();
      fetchStats();
      setSelectedProject(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to approve project.' });
    }
  };

  const handleReject = async (projectId) => {
    if (!rejectionReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for requesting changes.' });
      return;
    }

    try {
      await axios.put(
        `http://localhost:5000/api/admin/projects/${projectId}/reject`,
        { reason: rejectionReason },
        { headers: { 'admin-email': 'admin@universityhub.com' } }
      );
      setMessage({ type: 'success', text: 'Submission marked as changes requested.' });
      fetchProjects();
      fetchStats();
      setSelectedProject(null);
      setRejectionReason('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reject project.' });
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to permanently delete this project submission?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/admin/projects/${projectId}`, {
        headers: { 'admin-email': 'admin@universityhub.com' }
      });
      setMessage({ type: 'success', text: 'Project deleted permanently.' });
      fetchProjects();
      fetchStats();
      setSelectedProject(null);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete project.' });
    }
  };

  const handleCheckPlagiarism = async (projectId, projectTitle) => {
    setPlagiarismModal({ projectId, projectTitle });
    setPlagiarismLoading(true);
    setPlagiarismData(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/projects/${projectId}/plagiarism`,
        { headers: { 'admin-email': 'admin@universityhub.com' } }
      );
      setPlagiarismData(response.data.data);
      setPlagiarismScores((prev) => ({
        ...prev,
        [projectId]: {
          score: response.data.data.overallScore,
          riskLevel: response.data.data.riskLevel
        }
      }));
    } catch (error) {
      console.error('Plagiarism check failed:', error);
      setPlagiarismData({ error: 'Failed to run similarity check. Please try again.' });
    } finally {
      setPlagiarismLoading(false);
    }
  };

  const closePlagiarismModal = () => {
    setPlagiarismModal(null);
    setPlagiarismData(null);
    setPlagiarismLoading(false);
  };

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-1.5">
            FACULTY REVIEW PORTAL · REPOSITORY MODERATION
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Submission Review Queue</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Verify student project deliverables, check abstract similarity, and approve submissions for public indexing.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Total Submissions</span>
            <span className="text-2xl font-bold text-white font-mono">{stats.total}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <i className="bi bi-folder2-open"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Pending Review</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{stats.pending}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <i className="bi bi-clock-history"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Approved & Live</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{stats.approved}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <i className="bi bi-check2-circle"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 block mb-1">Rejected</span>
            <span className="text-2xl font-bold text-red-400 font-mono">{stats.rejected}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
            <i className="bi bi-x-circle"></i>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6 p-1.5 rounded-2xl bg-carbon-800/80 border border-white/10 w-fit">
        {[
          { key: 'pending', label: `Pending Review (${stats.pending})` },
          { key: 'approved', label: `Approved (${stats.approved})` },
          { key: 'rejected', label: `Rejected (${stats.rejected})` },
          { key: 'all', label: `All Submissions (${stats.total})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === tab.key
                ? 'bg-indigo-500/20 text-white border border-indigo-500/40'
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Submissions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="uh-bento-card h-48 animate-pulse bg-carbon-800/50" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="uh-bento-card p-14 text-center">
          <i className="bi bi-check2-all text-3xl text-emerald-400 block mb-3"></i>
          <h3 className="text-lg font-bold text-white mb-1">No {filter === 'all' ? '' : filter} submissions</h3>
          <p className="text-sm text-zinc-400">
            {filter === 'pending' ? 'All student submissions have been reviewed.' : `No ${filter} projects found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {projects.map((project) => {
            const sim = plagiarismScores[project._id];
            return (
              <div key={project._id} onMouseMove={handleCardMouseMove} className="uh-bento-card p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-xs font-mono text-indigo-300">
                        {project.branch} · {project.year}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                          project.status === 'approved'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : project.status === 'rejected'
                            ? 'bg-red-500/15 text-red-300 border-red-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {project.status}
                      </span>
                      {sim && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                            sim.riskLevel === 'high'
                              ? 'bg-red-500/15 text-red-300 border-red-500/30'
                              : sim.riskLevel === 'medium'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {sim.score}% Similarity ({sim.riskLevel})
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                    <span>
                      <i className="bi bi-person mr-1.5 text-zinc-500"></i>
                      {project.studentName}
                    </span>
                    <span>
                      <i className="bi bi-envelope mr-1.5 text-zinc-500"></i>
                      {project.studentEmail}
                    </span>
                    <span className="font-mono">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="py-4 space-y-3">
                  <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>

                  {project.aiSummary && (
                    <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-zinc-300">
                      <span className="font-mono uppercase text-[10px] text-indigo-400 block mb-1">
                        EXTRACTED REPORT SUMMARY
                      </span>
                      {project.aiSummary}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {(project.techStack || []).map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-md bg-carbon-900/90 border border-white/10 text-[11px] font-mono text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Deliverable Links & Moderation Actions */}
                <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="uh-btn-secondary px-3 py-1.5 rounded-lg text-xs text-zinc-200 flex items-center gap-1.5"
                      >
                        <i className="bi bi-github"></i> GitHub Repo
                      </a>
                    )}
                    {project.pdfUrl && (
                      <a
                        href={`http://localhost:5000/api/projects/${project._id}/download/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="uh-btn-secondary px-3 py-1.5 rounded-lg text-xs text-red-300 flex items-center gap-1.5"
                      >
                        <i className="bi bi-file-earmark-pdf"></i> Report.pdf
                      </a>
                    )}
                    {project.videoUrl && (
                      <a
                        href={`http://localhost:5000/api/projects/${project._id}/download/video`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="uh-btn-secondary px-3 py-1.5 rounded-lg text-xs text-purple-300 flex items-center gap-1.5"
                      >
                        <i className="bi bi-play-circle"></i> Demo Video
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="uh-btn-secondary px-3 py-1.5 rounded-lg text-xs text-emerald-300 flex items-center gap-1.5"
                      >
                        <i className="bi bi-globe2"></i> Live Demo
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCheckPlagiarism(project._id, project.title)}
                      className="uh-btn-secondary px-3.5 py-1.5 rounded-lg text-xs font-medium text-indigo-300 flex items-center gap-1.5"
                    >
                      <i className="bi bi-shield-check"></i> Similarity Check
                    </button>

                    {project.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(project._id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition"
                        >
                          <i className="bi bi-check-lg mr-1"></i> Approve
                        </button>
                        <button
                          onClick={() => setSelectedProject(project._id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition"
                        >
                          <i className="bi bi-x-lg mr-1"></i> Request Changes
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleDelete(project._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

                {selectedProject === project._id && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <textarea
                      placeholder="Specify what changes or missing deliverables are needed..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows="3"
                      className="w-full rounded-xl bg-carbon-900 border border-white/15 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(project._id)}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Send Feedback
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProject(null);
                          setRejectionReason('');
                        }}
                        className="uh-btn-secondary px-4 py-1.5 rounded-lg text-xs text-zinc-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Plagiarism / Similarity Modal */}
      {plagiarismModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closePlagiarismModal}
        >
          <div
            className="uh-bento-card max-w-2xl w-full p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 block">
                  ARCHIVE SIMILARITY CHECK
                </span>
                <h2 className="text-lg font-bold text-white">{plagiarismModal.projectTitle}</h2>
              </div>
              <button
                onClick={closePlagiarismModal}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {plagiarismLoading && (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-zinc-300">Comparing abstract & embeddings against approved archive...</p>
              </div>
            )}

            {plagiarismData?.error && (
              <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/25 text-center text-red-300 text-sm">
                {plagiarismData.error}
              </div>
            )}

            {plagiarismData && !plagiarismData.error && !plagiarismLoading && (
              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-carbon-900/90 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block mb-1">Overall Similarity Score</span>
                    <div className="text-3xl font-bold text-white font-mono">
                      {plagiarismData.overallScore}%
                    </div>
                    <span className="text-xs text-zinc-500 mt-1 block">
                      Compared against {plagiarismData.totalComparisons} approved project(s)
                    </span>
                  </div>
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase border ${
                      plagiarismData.riskLevel === 'high'
                        ? 'bg-red-500/15 text-red-300 border-red-500/30'
                        : plagiarismData.riskLevel === 'medium'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {plagiarismData.riskLevel} overlap
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white mb-3">
                    Closest Existing Projects ({plagiarismData.matches?.length || 0})
                  </h3>
                  {plagiarismData.matches && plagiarismData.matches.length > 0 ? (
                    <div className="space-y-3">
                      {plagiarismData.matches.map((match, idx) => (
                        <div key={match.projectId || idx} className="p-4 rounded-xl bg-carbon-900/70 border border-white/10">
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="text-sm font-semibold text-white">{match.title}</h4>
                            <span className="text-xs font-mono text-indigo-300">{match.similarityScore}% match</span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{match.description}</p>
                          <div className="flex items-center justify-between text-[11px] text-zinc-500">
                            <span>
                              {match.studentName} · {match.branch} ({match.year})
                            </span>
                            <a
                              href={`/projects/${match.projectId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-400 hover:underline"
                            >
                              Inspect Project →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center text-xs text-emerald-300">
                      No closely matching projects found in the repository.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
