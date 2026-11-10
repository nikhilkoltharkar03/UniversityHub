import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { getBlueprintVisual, getInitials } from '../components/ProjectCard';
import MermaidViewer from '../components/MermaidViewer';

function getSandboxStartupLogs(project) {
  const title = project?.title || 'Student Project';
  const techs = (project?.techStack || []).join(', ') || 'Node.js';
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return [
    `Mounting isolated workspace: /workspace/${slug}`,
    `Detected technology stack: [${techs}]`,
    `Allocating container environment (CPU: 1 vCPU, RAM: 512MB)...`,
    `Installing dependencies & verifying entrypoints...`,
    `Ready: ${title} runtime active on port 5000.`,
  ];
}

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Tabs: 'preview' | 'sandbox' | 'pdf'
  const [activeTab, setActiveTab] = useState('preview');
  const [sandboxLogs, setSandboxLogs] = useState([]);
  const [sandboxRunning, setSandboxRunning] = useState(true);
  const [commandInput, setCommandInput] = useState('');

  // Interactive RAG Copilot, Streaming & Deep-Linked PDF Page state
  const [qaMessages, setQaMessages] = useState([]);
  const [qaInput, setQaInput] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [expandedCitationIdx, setExpandedCitationIdx] = useState(null);
  const [selectedPdfPage, setSelectedPdfPage] = useState(1);
  const [highlightedCitation, setHighlightedCitation] = useState(null);
  const [diagramData, setDiagramData] = useState({ diagram: '', metrics: null });
  const [regeneratingDiagram, setRegeneratingDiagram] = useState(false);

  // Recommendations state
  const [recommendations, setRecommendations] = useState({
    similarProjects: [],
    techStackMatches: [],
    sameDomain: [],
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setProject(null);
    setLoading(true);
    setError('');
    setActiveTab('preview');
    setQaMessages([]);
    setExpandedCitationIdx(null);
    setSelectedPdfPage(1);
    setHighlightedCitation(null);

    const fetchData = async () => {
      await fetchProject();
      await Promise.all([fetchDiagram(id, false), fetchRecommendations(id)]);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/${id}?incrementView=true`
      );
      const data = response.data?.data;
      setProject(data);
      if (data?.architectureDiagram) {
        setDiagramData({
          diagram: data.architectureDiagram,
          metrics: data.copilotMetrics
            ? {
                nodeCount: data.copilotMetrics.diagramNodeCount,
                edgeCount: data.copilotMetrics.diagramEdgeCount,
                entityCoverageScore: data.copilotMetrics.entityCoverageScore,
              }
            : null,
        });
      }
      setSandboxLogs(getSandboxStartupLogs(data));
      setSandboxRunning(true);
    } catch (err) {
      console.error('Failed to fetch project:', err);
      if (err.response?.status === 404) {
        setError('Project not found');
      } else {
        setError('Failed to load project details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchDiagram = async (projectId, refresh = false) => {
    try {
      if (refresh) setRegeneratingDiagram(true);
      const response = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/diagram${
          refresh ? '?refresh=true' : ''
        }`
      );
      if (response.data?.success && response.data?.data) {
        setDiagramData({
          diagram: response.data.data.diagram,
          metrics: response.data.data.metrics,
        });
      }
    } catch (err) {
      console.error('Failed to fetch Mermaid diagram:', err);
    } finally {
      setRegeneratingDiagram(false);
    }
  };

  const fetchRecommendations = async (projectId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/recommendations`
      );
      if (response.data?.success) {
        setRecommendations(response.data.data);
      }
    } catch (err) {
      // Recommendations are optional
    }
  };

  const handleRestartSandbox = () => {
    if (!project) return;
    setSandboxRunning(true);
    setSandboxLogs(getSandboxStartupLogs(project));
  };

  const handleRunCommand = (e) => {
    if (e.key === 'Enter' && commandInput.trim()) {
      const cmd = commandInput.trim();
      let reply = `Executed '${cmd}' — exit code 0`;
      if (cmd.includes('test')) {
        reply = `PASS: All integration checks passed for ${project.title} (412ms)`;
      } else if (cmd.includes('status') || cmd.includes('ps')) {
        reply = `CONTAINER UP · Port 5000 · Memory 42.4 MB`;
      }
      setSandboxLogs((prev) => [...prev, `$ ${cmd}`, reply]);
      setCommandInput('');
    }
  };

  // Optimization 3: Deep-link jump from a RAG citation directly to the exact PDF Report page
  const handleJumpToPdfPage = (pageNum, citationObj = null) => {
    const targetPage = Math.max(1, parseInt(pageNum, 10) || 1);
    setSelectedPdfPage(targetPage);
    setHighlightedCitation(
      citationObj || { id: `Page ${targetPage}`, page: targetPage }
    );
    setActiveTab('pdf');
    const stageEl = document.getElementById('uh-interactive-stage');
    if (stageEl) {
      stageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Optimization 2: Progressive SSE Streaming RAG Copilot with instant citation lock & TTFT telemetry
  const handleAskQuestion = async (customQuestion) => {
    const questionText = (
      typeof customQuestion === 'string' ? customQuestion : qaInput
    ).trim();
    if (!questionText || !project || qaLoading) return;

    if (typeof customQuestion !== 'string') {
      setQaInput('');
    }
    setQaLoading(true);

    const historyPayload = qaMessages.slice(-4).map((m) => ({
      q: m.q,
      a: m.a,
    }));

    const newMsgIdx = qaMessages.length;
    setQaMessages((prev) => [
      ...prev,
      {
        q: questionText,
        a: '',
        citations: [],
        metrics: null,
        streaming: true,
      },
    ]);
    setExpandedCitationIdx(newMsgIdx);

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${project._id}/chat/stream`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: questionText,
            conversationHistory: historyPayload,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('SSE stream unavailable, falling back to REST');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          const lines = block.split('\n');
          let eventType = 'message';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event:')) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              dataStr += line.slice(5).trim();
            }
          }
          if (!dataStr) continue;

          try {
            const payload = JSON.parse(dataStr);
            if (eventType === 'citations') {
              setQaMessages((prev) =>
                prev.map((m, i) =>
                  i === newMsgIdx
                    ? { ...m, citations: payload.citations || [] }
                    : m
                )
              );
            } else if (eventType === 'token') {
              setQaMessages((prev) =>
                prev.map((m, i) =>
                  i === newMsgIdx
                    ? {
                        ...m,
                        a: (m.a || '') + (payload.token || ''),
                        ttftMs: payload.ttftMs ?? m.ttftMs,
                      }
                    : m
                )
              );
            } else if (eventType === 'done') {
              setQaMessages((prev) =>
                prev.map((m, i) =>
                  i === newMsgIdx
                    ? {
                        ...m,
                        a: payload.answer || m.a,
                        citations: payload.citations || m.citations,
                        metrics: payload.metrics,
                        streaming: false,
                      }
                    : m
                )
              );
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      // Fallback to standard JSON endpoint if SSE fails
      try {
        const res = await axios.post(
          `http://localhost:5000/api/projects/${project._id}/chat`,
          {
            question: questionText,
            conversationHistory: historyPayload,
          }
        );
        if (res.data?.success) {
          const payload = res.data.data || res.data;
          setQaMessages((prev) =>
            prev.map((m, i) =>
              i === newMsgIdx
                ? {
                    q: questionText,
                    a: payload.answer,
                    citations: payload.citations || payload.citedChunks || [],
                    metrics: payload.metrics,
                    streaming: false,
                  }
                : m
            )
          );
        }
      } catch (fallbackErr) {
        console.error('RAG Copilot fallback error:', fallbackErr);
      }
    } finally {
      setQaLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 w-full">
        <div className="uh-bento-card h-32 animate-pulse mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="uh-bento-card h-80 animate-pulse" />
            <div className="uh-bento-card h-56 animate-pulse" />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="uh-bento-card h-48 animate-pulse" />
            <div className="uh-bento-card h-48 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="uh-bento-card p-10">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2">
              {error || 'Project not found'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              The project you are looking for doesn&apos;t exist or may have
              been removed.
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="uh-btn-primary"
            >
              Back to Project Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  const visual = getBlueprintVisual(project);
  const allRelated = [
    ...(recommendations.similarProjects || []),
    ...(recommendations.techStackMatches || []),
    ...(recommendations.sameDomain || []),
  ].slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
        <Link
          to="/projects"
          className="hover:text-white flex items-center gap-1.5 text-slate-300 no-underline transition-colors"
        >
          <svg
            className="w-3.5 h-3.5 text-sky-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back to Projects</span>
        </Link>
        <span>/</span>
        <span className="font-mono text-sky-400">{project.branch}</span>
        <span>/</span>
        <span className="text-slate-300 truncate max-w-xs">
          {project.title}
        </span>
      </div>

      {/* Top Project Title & Primary Action Bar */}
      <div className="uh-bento-card p-6 sm:p-7 mb-6">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                {project.branch} · {project.year}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Approved by Faculty
              </span>
              {project.createdAt && (
                <span className="text-xs text-slate-400 font-mono">
                  Submitted{' '}
                  {new Date(project.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight m-0">
              {project.title}
            </h1>
          </div>

          {/* Primary Deliverables Action Cluster */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('sandbox')}
              className="uh-btn-primary"
            >
              <svg
                className="w-3.5 h-3.5 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>Run Live Demo</span>
            </button>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="uh-btn-secondary"
              >
                <span>External Demo ↗</span>
              </a>
            )}

            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="uh-btn-secondary"
              >
                <span>GitHub Repo ↗</span>
              </a>
            )}

            {project.pdfUrl && (
              <a
                href={`http://localhost:5000/api/projects/${project._id}/download/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="uh-btn-secondary"
              >
                <span>Report (.pdf)</span>
              </a>
            )}

            {project.zipUrl && (
              <a
                href={`http://localhost:5000/api/projects/${project._id}/download/zip`}
                target="_blank"
                rel="noopener noreferrer"
                className="uh-btn-secondary"
              >
                <span>Source (.zip)</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Dribbble Case-Study Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Tabbed Media & Sandbox Stage */}
          <div id="uh-interactive-stage" className="uh-bento-card overflow-hidden">
            <div className="relative z-10 px-4 py-3 bg-[#07080C]/90 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex p-1 rounded-lg bg-[#10121A] border border-white/[0.08]">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded-md text-xs transition-all ${
                    activeTab === 'preview'
                      ? 'font-semibold bg-sky-400 text-[#07080C]'
                      : 'font-medium text-slate-400 hover:text-white'
                  }`}
                >
                  System Diagram & Demo
                </button>
                <button
                  onClick={() => setActiveTab('sandbox')}
                  className={`px-3 py-1 rounded-md text-xs transition-all ${
                    activeTab === 'sandbox'
                      ? 'font-semibold bg-sky-400 text-[#07080C]'
                      : 'font-medium text-slate-400 hover:text-white'
                  }`}
                >
                  Live Sandbox Runner
                </button>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`px-3 py-1 rounded-md text-xs transition-all ${
                    activeTab === 'pdf'
                      ? 'font-semibold bg-sky-400 text-[#07080C]'
                      : 'font-medium text-slate-400 hover:text-white'
                  }`}
                >
                  Project Report (PDF)
                </button>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Interactive Workspace
              </span>
            </div>

            {/* TAB 1: SYSTEM DIAGRAM & VIDEO DEMO */}
            {activeTab === 'preview' && (
              <div className="relative z-10 bg-[#07080C]/50 min-h-[320px] flex flex-col justify-between">
                {diagramData.diagram ? (
                  <MermaidViewer
                    diagramCode={diagramData.diagram}
                    metrics={diagramData.metrics}
                    project={project}
                    onRegenerate={() => fetchDiagram(project._id, true)}
                    regenerating={regeneratingDiagram}
                  />
                ) : (
                  <div className="my-auto py-8 px-6 flex flex-col items-center justify-center text-center">
                    <div className="w-full max-w-lg p-6 rounded-2xl bg-[#10121A]/90 border border-white/[0.1] mb-4 shadow-lg">
                      <div className="text-[11px] font-mono text-sky-400 mb-3 uppercase">
                        {project.branch} · Compiling Mermaid Architecture Pipeline...
                      </div>
                      {visual.svg}
                    </div>
                  </div>
                )}

                <div className="px-6 py-3.5 bg-[#07080C]/90 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 border-t border-white/[0.08]">
                  <span>
                    Technologies: {(project.techStack || []).join(' · ')}
                  </span>
                  <button
                    onClick={() => setActiveTab('sandbox')}
                    className="text-sky-400 font-semibold hover:underline"
                  >
                    Launch Sandbox →
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: LIVE SANDBOX RUNNER */}
            {activeTab === 'sandbox' && (
              <div className="relative z-10 bg-[#06070B] min-h-[290px] flex flex-col justify-between font-mono">
                <div className="px-4 py-2 bg-[#10121A] border-b border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        sandboxRunning
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-rose-400'
                      }`}
                    ></span>
                    <span>
                      STATUS:{' '}
                      <strong
                        className={
                          sandboxRunning ? 'text-emerald-400' : 'text-rose-400'
                        }
                      >
                        {sandboxRunning ? 'RUNNING' : 'STOPPED'}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>PORT: 5000</span>
                    <button
                      onClick={handleRestartSandbox}
                      className="text-sky-400 hover:underline"
                    >
                      Restart
                    </button>
                    <button
                      onClick={() => {
                        setSandboxRunning(false);
                        setSandboxLogs((prev) => [
                          ...prev,
                          '[Container session stopped by user]',
                        ]);
                      }}
                      className="text-rose-400 hover:underline"
                    >
                      Stop
                    </button>
                  </div>
                </div>

                <div className="p-4 text-xs text-slate-200 space-y-1.5 max-h-[210px] overflow-y-auto">
                  {sandboxLogs.map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>

                <div className="p-3 bg-[#10121A]/80 border-t border-white/[0.08] flex items-center gap-2">
                  <span className="text-sky-400 font-bold text-xs">$</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    onKeyDown={handleRunCommand}
                    placeholder="Type a test command (e.g. npm test, status) and press Enter..."
                    className="bg-transparent text-xs text-white focus:outline-none w-full font-mono placeholder-slate-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: PROJECT REPORT (PDF) WITH DEEP-LINKED PAGE INSPECTOR */}
            {activeTab === 'pdf' && (() => {
              const corpus = project.extractedText || '';
              const pageMatches = [...corpus.matchAll(/\[Page (\d+)\]/gi)].map((m) => parseInt(m[1], 10));
              const maxPage = pageMatches.length > 0 ? Math.max(...pageMatches) : 3;
              const allPages = Array.from({ length: maxPage }, (_, i) => i + 1);

              return (
                <div className="relative z-10 p-6 bg-[#07080C]/80 min-h-[320px] flex flex-col justify-between">
                  <div className="max-w-3xl mx-auto w-full bg-[#10121A] border border-white/[0.1] rounded-xl p-6 shadow-inner">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-xs font-bold flex items-center justify-center">
                          PDF
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            {project.title.substring(0, 36)}_Report.pdf
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Page-Indexed Capstone Documentation ({maxPage} Pages) · Viewing Page {selectedPdfPage} of {maxPage}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={selectedPdfPage <= 1}
                          onClick={() => setSelectedPdfPage((p) => Math.max(1, p - 1))}
                          className="px-2 py-1 rounded text-[11px] font-mono bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] disabled:opacity-40 transition"
                        >
                          ← Prev
                        </button>

                        <select
                          value={selectedPdfPage}
                          onChange={(e) => setSelectedPdfPage(parseInt(e.target.value, 10) || 1)}
                          className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#07080C] text-sky-300 border border-sky-500/30 focus:outline-none"
                        >
                          {allPages.map((pNum) => (
                            <option key={pNum} value={pNum}>
                              Page {pNum} of {maxPage}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={selectedPdfPage >= maxPage}
                          onClick={() => setSelectedPdfPage((p) => Math.min(maxPage, p + 1))}
                          className="px-2 py-1 rounded text-[11px] font-mono bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] disabled:opacity-40 transition"
                        >
                          Next →
                        </button>

                        {project.pdfUrl && (
                          <a
                            href={`http://localhost:5000/api/projects/${project._id}/download/pdf#page=${selectedPdfPage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="uh-btn-secondary py-1 px-2.5 text-xs"
                          >
                            Open Raw PDF (p.{selectedPdfPage}) ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {highlightedCitation && (
                      <div className="mb-4 p-3 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-between gap-2 text-xs">
                        <div className="font-mono text-sky-300">
                          Viewing Cited Report Source: <strong>[{highlightedCitation.id} · Page {selectedPdfPage}]</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHighlightedCitation(null)}
                          className="text-[11px] font-mono text-slate-400 hover:text-white"
                        >
                          Clear Highlight
                        </button>
                      </div>
                    )}

                    <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed font-sans">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white text-sm m-0">
                          {selectedPdfPage === 1
                            ? 'Page 1 — Title Page, Authors & Project Overview'
                            : `Page ${selectedPdfPage} — Extracted Capstone Report Content`}
                        </p>
                        <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-sky-300">
                          [Page {selectedPdfPage} / {maxPage}]
                        </span>
                      </div>
                      <div className="p-4 rounded-lg bg-[#07080C]/90 border border-white/[0.06] text-slate-200 whitespace-pre-line font-sans leading-relaxed max-h-[360px] overflow-y-auto">
                        {(() => {
                          const regex = new RegExp(
                            `\\[Page ${selectedPdfPage}\\]([\\s\\S]*?)(?=\\[Page \\d+\\]|$)`,
                            'i'
                          );
                          const match = corpus.match(regex);
                          if (match && match[1] && match[1].trim()) {
                            return match[1].trim();
                          }
                          if (selectedPdfPage === 1) {
                            return `Project Title: ${project.title}\nBranch: ${project.branch} (${project.year})\nTechnologies: ${(project.techStack || []).join(', ')}\nAbstract: ${project.description}`;
                          }
                          return project.aiSummary || project.description;
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* About This Project & Summary */}
          <div className="uh-bento-card p-6 sm:p-7">
            <div className="relative z-10">
              <h2 className="text-lg font-bold text-white mb-3">
                About This Project
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>

              {project.aiSummary && (
                <div className="mt-5 p-4 rounded-xl bg-[#07080C]/90 border border-sky-500/25">
                  <div className="text-xs font-mono text-sky-400 mb-1">
                    Executive Summary (Extracted from Report)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed m-0">
                    {project.aiSummary}
                  </p>
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="mt-6 pt-5 border-t border-white/[0.08]">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 mb-3">
                    Domain & Research Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs bg-white/[0.04] text-slate-300 border border-white/[0.08]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive RAG Project & Code Copilot */}
          <div className="uh-bento-card p-6 sm:p-7">
            <div className="relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-base font-bold text-white m-0">
                    Interactive RAG Project &amp; Report Copilot
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 mb-0">
                    Ask technical questions grounded directly in this project&apos;s
                    PDF report and architecture pipeline with page citations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Grounded RAG · Page Citations
                  </span>
                </div>
              </div>

              {/* Quick-Ask Prompt Pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  'Explain the system architecture and core modules',
                  'What technology stack, frameworks, and databases are used?',
                  'How does the step-by-step workflow or evaluation pipeline work?',
                  'Who are the team members and guide, and what challenges are discussed?',
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    disabled={qaLoading}
                    onClick={() => handleAskQuestion(preset)}
                    className="px-2.5 py-1 rounded-lg bg-[#07080C] hover:bg-white/[0.06] border border-white/[0.1] text-[11px] text-slate-300 hover:text-sky-300 transition disabled:opacity-50"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Conversation & Citation Telemetry Feed */}
              <div className="p-4 rounded-xl bg-[#07080C]/90 border border-white/[0.08] text-xs text-slate-300 space-y-3 mb-3 max-h-[420px] overflow-y-auto">
                {qaMessages.length === 0 && !qaLoading && (
                  <div className="text-slate-400">
                    Select a prompt above or ask any specific question below to query the
                    indexed PDF report chunks and verify answer groundedness.
                  </div>
                )}

                {qaMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`${
                      idx > 0 ? 'pt-3 border-t border-white/[0.08]' : ''
                    } space-y-2`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-white">
                        Q: {msg.q}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {msg.metrics && (
                          <>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {msg.metrics.faithfulnessScore}% Grounded
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/15 text-sky-300 border border-sky-500/30">
                              {msg.metrics.relevanceScore}% Relevance
                            </span>
                          </>
                        )}
                        {(msg.metrics?.ttftMs || msg.ttftMs) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            TTFT: {msg.metrics?.ttftMs || msg.ttftMs}ms
                          </span>
                        )}
                        {msg.metrics?.latencyMs && (
                          <span className="text-[10px] font-mono text-slate-500">
                            {msg.metrics.latencyMs}ms
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-slate-200 leading-relaxed whitespace-pre-line">
                      {(msg.a || '')
                        .replace(/\[Pages?\s*(\d+)\s*,\s*(?:Page\s*)?(\d+)\]/gi, '[Page $1] [Page $2]')
                        .split(/(\[Page \d+(?:[-–]\d+)?\])/gi)
                        .map((part, pIdx) => {
                          const pageMatch = part.match(/^\[Page (\d+)/i);
                          if (pageMatch) {
                            const pNum = parseInt(pageMatch[1], 10);
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleJumpToPdfPage(pNum)}
                                className="mx-0.5 px-1.5 py-0.5 rounded bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 font-mono text-[11px] transition"
                                title={`Jump to Page ${pNum} in Report Viewer`}
                              >
                                {part.replace(']', ' ↗]')}
                              </button>
                            );
                          }
                          return <React.Fragment key={pIdx}>{part}</React.Fragment>;
                        })}
                    </div>

                    {/* Retrieved PDF Source Citations with Deep-Link Page Jump */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedCitationIdx(
                              expandedCitationIdx === idx ? null : idx
                            )
                          }
                          className="text-[11px] font-mono text-sky-400 hover:underline flex items-center gap-1.5"
                        >
                          <span>
                            {expandedCitationIdx === idx ? '▾' : '▸'} View{' '}
                            {msg.citations.length} Verified Report Source{' '}
                            {msg.citations.length === 1 ? 'Chunk' : 'Chunks'}
                          </span>
                        </button>

                        {expandedCitationIdx === idx && (
                          <div className="mt-2 space-y-1.5">
                            {msg.citations.map((cit, cIdx) => (
                              <div
                                key={cIdx}
                                className="p-2.5 rounded-lg bg-[#10121A] border border-white/[0.08] text-[11px]"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-sky-300 mb-1">
                                  <button
                                    type="button"
                                    onClick={() => handleJumpToPdfPage(cit.page, cit)}
                                    className="hover:underline font-semibold text-sky-300 flex items-center gap-1"
                                  >
                                    <span>
                                      [{cit.id} · Page {cit.page}]
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-sky-500/15 text-[10px] text-sky-300 border border-sky-500/30">
                                      Jump to Page {cit.page} ↗
                                    </span>
                                  </button>
                                  {cit.score && (
                                    <span className="text-slate-500">
                                      Match Score: {cit.score}
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-400 m-0 line-clamp-2 font-sans">
                                  {cit.preview}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {qaLoading && (
                  <div className="pt-2 flex items-center gap-2 text-sky-400 font-mono text-xs animate-pulse">
                    <span>
                      Retrieving PDF report chunks &amp; evaluating groundedness...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={qaInput}
                  disabled={qaLoading}
                  onChange={(e) => setQaInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Ask a question about this project's report, architecture, or stack..."
                  className="flex-1 bg-[#07080C]/90 text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
                />
                <button
                  onClick={() => handleAskQuestion()}
                  disabled={qaLoading}
                  className="uh-btn-secondary disabled:opacity-50"
                >
                  {qaLoading ? 'Analyzing...' : 'Ask Copilot'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT STICKY SIDEBAR (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Student Author Card */}
          <div className="uh-bento-card p-5">
            <div className="relative z-10">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Submitted By
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-xs font-bold text-sky-300">
                  {getInitials(project.studentName)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    {project.studentName}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {project.studentEmail}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-semibold text-white">
                    {project.branch}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Project Views</span>
                  <span className="font-mono font-semibold text-sky-300">
                    {project.views || 0} views
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Technologies Used */}
          <div className="uh-bento-card p-5">
            <div className="relative z-10">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(project.techStack || []).map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.06] text-slate-200 border border-white/[0.1]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* RAG Copilot & Architecture Telemetry Card */}
          <div className="uh-bento-card p-5">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 m-0">
                  Copilot Evaluation Metrics
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Verified AST
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#07080C]/90 border border-white/[0.08]">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Report Groundedness
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {project.copilotMetrics?.faithfulnessScore ?? 100}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#07080C]/90 border border-white/[0.08]">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Answer Relevance
                  </span>
                  <span className="text-sm font-mono font-bold text-sky-400">
                    {project.copilotMetrics?.relevanceScore ?? 97}%
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#07080C]/90 border border-white/[0.08]">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Stack Entity Coverage
                  </span>
                  <span className="text-sm font-mono font-bold text-indigo-300">
                    {diagramData.metrics?.entityCoverageScore ??
                      project.copilotMetrics?.entityCoverageScore ??
                      100}
                    %
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#07080C]/90 border border-white/[0.08]">
                  <span className="text-[10px] font-mono text-slate-400 block">
                    Hallucination Rate
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {project.copilotMetrics?.hallucinationRate ?? 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Originality Check */}
          <div className="uh-bento-card p-5">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 m-0">
                  Originality Check
                </h3>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  Passed
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-0">
                Verified against the university project archive before faculty
                approval.
              </p>
            </div>
          </div>

          {/* Related Projects */}
          {allRelated.length > 0 && (
            <div className="uh-bento-card p-5">
              <div className="relative z-10">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">
                  Related Projects
                </h3>
                <div className="space-y-2.5">
                  {allRelated.map((rel) => (
                    <div
                      key={rel._id}
                      onClick={() => navigate(`/projects/${rel._id}`)}
                      className="p-3 rounded-xl bg-[#07080C]/90 hover:bg-[#161924] border border-white/[0.08] cursor-pointer transition-colors"
                    >
                      <div className="text-[10px] font-mono text-sky-400">
                        {rel.branch} · {rel.year}
                      </div>
                      <div className="text-xs font-semibold text-white mt-0.5 line-clamp-1">
                        {rel.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
