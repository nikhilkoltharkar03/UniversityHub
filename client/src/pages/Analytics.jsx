import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';

const handleCardMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
};

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:5000/api/projects/analytics/stats');
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data from server.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1380px] mx-auto px-6 py-12">
        <div className="h-8 w-64 bg-carbon-800/80 rounded-lg animate-pulse mb-3" />
        <div className="h-4 w-96 bg-carbon-800/60 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="uh-bento-card h-32 animate-pulse bg-carbon-800/50" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="uh-bento-card h-80 animate-pulse bg-carbon-800/50" />
          <div className="uh-bento-card h-80 animate-pulse bg-carbon-800/50" />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-[1380px] mx-auto px-6 py-16">
        <div className="uh-bento-card p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-4">
            <i className="bi bi-exclamation-triangle text-xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Unable to Load Analytics</h2>
          <p className="text-sm text-zinc-400 mb-6">{error}</p>
          <button onClick={fetchAnalytics} className="uh-btn-primary px-6 py-2.5 rounded-xl text-sm">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const yearData = Object.entries(stats.projectsByYear || {}).map(([year, count]) => ({
    year,
    projects: count
  }));

  const branchData = Object.entries(stats.projectsByBranch || {}).map(([branch, count]) => ({
    name: branch,
    value: count
  }));

  const deploymentData = [
    { name: 'Hosted Live', value: stats.deploymentStats?.hosted || 0 },
    { name: 'Code & Report Only', value: stats.deploymentStats?.nonHosted || 0 }
  ];

  const BRANCH_COLORS = ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#a855f7', '#ec4899', '#3b82f6'];
  const DEPLOYMENT_COLORS = ['#10b981', '#3f3f46'];

  const tooltipStyle = {
    background: '#121316',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '12px',
    color: '#F4F4F6',
    fontSize: '12px',
    boxShadow: '0 16px 32px rgba(0,0,0,0.5)'
  };

  return (
    <div className="max-w-[1380px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">
            ARCHIVE TELEMETRY · LIVE REPOSITORY METRICS
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Department & Stack Analytics</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Breakdown of student project submissions by engineering branch, academic year, and technology stack.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="uh-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold text-zinc-300 flex items-center gap-2 self-start md:self-auto"
        >
          <i className="bi bi-arrow-clockwise text-indigo-400"></i>
          Refresh Data
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Total Submissions
            </span>
            <div className="text-3xl font-bold text-white font-mono">{stats.totalProjects}</div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">Verified in Archive</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <i className="bi bi-folder2-open text-xl"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Repository Views
            </span>
            <div className="text-3xl font-bold text-white font-mono">
              {(stats.totalViews || 0).toLocaleString()}
            </div>
            <span className="text-[11px] text-cyan-400 mt-1 inline-block">Student & Faculty Reads</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <i className="bi bi-eye text-xl"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Live Hosted Demos
            </span>
            <div className="text-3xl font-bold text-white font-mono">
              {stats.deploymentStats?.hosted || 0}
            </div>
            <span className="text-[11px] text-emerald-400 mt-1 inline-block">Interactive Endpoints</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <i className="bi bi-globe2 text-xl"></i>
          </div>
        </div>

        <div onMouseMove={handleCardMouseMove} className="uh-bento-card p-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Avg. Stack Depth
            </span>
            <div className="text-3xl font-bold text-white font-mono">{stats.avgTechStackSize}</div>
            <span className="text-[11px] text-amber-400 mt-1 inline-block">Libraries per Project</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <i className="bi bi-layers text-xl"></i>
          </div>
        </div>
      </div>

      {/* Charts Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Projects by Academic Year */}
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card lg:col-span-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Submissions by Academic Year</h2>
              <p className="text-xs text-zinc-400">Distribution across 1st to 4th year cohorts</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-zinc-400">
              COHORT BREAKDOWN
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="year" stroke="#9496A1" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9496A1" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="projects" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projects by Engineering Branch */}
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card lg:col-span-6 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Departmental Share</h2>
              <p className="text-xs text-zinc-400">Percentage of total projects by engineering branch</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-mono text-zinc-400">
              BRANCH RATIO
            </span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={branchData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={95}
                fill="#6366f1"
                dataKey="value"
              >
                {branchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BRANCH_COLORS[index % BRANCH_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Technologies */}
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card lg:col-span-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Most Used Frameworks & Tools</h2>
              <p className="text-xs text-zinc-400">Top 10 technologies extracted from project repositories and reports</p>
            </div>
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300">
              TOP 10 STACK
            </span>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={stats.topTechnologies || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" stroke="#9496A1" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" stroke="#E4E4E7" width={110} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="count" fill="#818cf8" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Deployment Status */}
        <div onMouseMove={handleCardMouseMove} className="uh-bento-card lg:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Live Deployment Ratio</h2>
                <p className="text-xs text-zinc-400">Hosted URLs vs source-only archives</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deploymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                  innerRadius={55}
                  outerRadius={88}
                  fill="#10b981"
                  dataKey="value"
                >
                  {deploymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPLOYMENT_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-carbon-900/90 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Active Live Demos
            </span>
            <span className="font-mono font-semibold text-white">
              {stats.deploymentStats?.hosted || 0} / {stats.totalProjects}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
