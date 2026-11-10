import React from 'react';
import { useNavigate } from 'react-router-dom';

function getBlueprintVisual(project) {
  const branch = (project.branch || 'CSE').toUpperCase();
  const titleLower = (project.title || '').toLowerCase();

  if (branch === 'MECH' || titleLower.includes('quadcopter') || titleLower.includes('drone')) {
    return {
      accent: 'from-sky-500/20 via-indigo-500/10 to-transparent',
      svg: (
        <svg className="w-full h-14" viewBox="0 0 260 52" fill="none">
          <rect x="6" y="11" width="66" height="30" rx="6" fill="#0B0F19" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="39" y="29" fill="#7DD3FC" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">SOLAR_CELLS</text>
          <line x1="72" y1="26" x2="98" y2="26" stroke="#38BDF8" strokeWidth="1.4" className="uh-flow-line" />
          <rect x="98" y="8" width="64" height="36" rx="7" fill="#0B0F19" stroke="#E2E8F0" strokeWidth="1.2" />
          <text x="130" y="25" fill="#FFFFFF" fontFamily="JetBrains Mono" fontWeight="bold" fontSize="8" textAnchor="middle">ROS_FLIGHT</text>
          <text x="130" y="36" fill="#94A3B8" fontFamily="JetBrains Mono" fontSize="6.5" textAnchor="middle">PID Control</text>
          <line x1="162" y1="26" x2="188" y2="26" stroke="#10B981" strokeWidth="1.4" className="uh-flow-line" />
          <rect x="188" y="11" width="66" height="30" rx="6" fill="#0B0F19" stroke="#10B981" strokeWidth="1.2" />
          <text x="221" y="29" fill="#6EE7B7" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">OPENCV_24FPS</text>
        </svg>
      ),
    };
  }

  if (titleLower.includes('blockchain') || titleLower.includes('credential') || branch === 'IT') {
    return {
      accent: 'from-emerald-500/20 via-sky-500/10 to-transparent',
      svg: (
        <svg className="w-full h-14" viewBox="0 0 260 52" fill="none">
          <rect x="8" y="11" width="68" height="30" rx="6" fill="#0B0F19" stroke="#94A3B8" strokeWidth="1.2" />
          <text x="42" y="29" fill="#E2E8F0" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">IPFS_DEGREE</text>
          <line x1="76" y1="26" x2="100" y2="26" stroke="#38BDF8" strokeWidth="1.4" className="uh-flow-line" />
          <rect x="100" y="9" width="64" height="34" rx="6" fill="#0B0F19" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="132" y="25" fill="#7DD3FC" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">MERKLE_ROOT</text>
          <text x="132" y="36" fill="#64748B" fontFamily="JetBrains Mono" fontSize="6.5" textAnchor="middle">Solidity</text>
          <line x1="164" y1="26" x2="190" y2="26" stroke="#10B981" strokeWidth="1.4" className="uh-flow-line" />
          <rect x="190" y="11" width="62" height="30" rx="6" fill="#0B0F19" stroke="#10B981" strokeWidth="1.2" />
          <text x="221" y="29" fill="#6EE7B7" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">VERIFIED</text>
        </svg>
      ),
    };
  }

  if (branch === 'ECE' || titleLower.includes('iot') || titleLower.includes('agriculture')) {
    return {
      accent: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      svg: (
        <svg className="w-full h-14" viewBox="0 0 260 52" fill="none">
          <polyline points="12,36 40,32 68,14 96,28 124,12 152,25 180,16 208,30 245,12" stroke="#10B981" strokeWidth="2" fill="none" />
          <text x="130" y="47" fill="#94A3B8" fontFamily="JetBrains Mono" fontSize="7" textAnchor="middle">ESP32 MQTT SOIL MOISTURE STREAM</text>
        </svg>
      ),
    };
  }

  if (branch === 'CIVIL' || titleLower.includes('bridge') || titleLower.includes('vibration')) {
    return {
      accent: 'from-amber-500/20 via-sky-500/10 to-transparent',
      svg: (
        <svg className="w-full h-14" viewBox="0 0 260 52" fill="none">
          <polyline points="10,26 30,10 50,40 70,12 90,38 110,20 130,30 150,8 170,42 190,18 210,32 245,24" stroke="#38BDF8" strokeWidth="1.6" fill="none" />
          <text x="130" y="48" fill="#94A3B8" fontFamily="JetBrains Mono" fontSize="7" textAnchor="middle">FFT HARMONIC VIBRATION SPECTRUM</text>
        </svg>
      ),
    };
  }

  if (titleLower.includes('kubernetes') || titleLower.includes('microservice')) {
    return {
      accent: 'from-sky-500/20 via-blue-500/10 to-transparent',
      svg: (
        <svg className="w-full h-14" viewBox="0 0 260 52" fill="none">
          <rect x="10" y="11" width="60" height="30" rx="6" fill="#0B0F19" stroke="#38BDF8" strokeWidth="1.2" />
          <text x="40" y="29" fill="#7DD3FC" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">API_GW</text>
          <line x1="70" y1="26" x2="100" y2="26" stroke="#38BDF8" strokeWidth="1.4" className="uh-flow-line" />
          <rect x="100" y="11" width="60" height="30" rx="6" fill="#0B0F19" stroke="#E2E8F0" strokeWidth="1.2" />
          <text x="130" y="29" fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">KAFKA_BUS</text>
          <line x1="160" y1="26" x2="190" y2="26" stroke="#10B981" strokeWidth="1.4" className="uh-flow-line" />
          <rect x="190" y="11" width="60" height="30" rx="6" fill="#0B0F19" stroke="#10B981" strokeWidth="1.2" />
          <text x="220" y="29" fill="#6EE7B7" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">K8S_PODS</text>
        </svg>
      ),
    };
  }

  // Default CSE / 3D Graph visual
  return {
    accent: 'from-indigo-500/20 via-sky-500/10 to-transparent',
    svg: (
      <svg className="w-full h-14" viewBox="0 0 260 52" fill="none">
        <circle cx="35" cy="36" r="6" fill="#38BDF8" />
        <circle cx="90" cy="14" r="5" fill="#64748B" />
        <circle cx="130" cy="38" r="6" fill="#38BDF8" />
        <circle cx="175" cy="16" r="6" fill="#38BDF8" />
        <circle cx="225" cy="28" r="7" fill="#10B981" />
        <line x1="35" y1="36" x2="90" y2="14" stroke="#334155" strokeWidth="1.2" />
        <line x1="35" y1="36" x2="130" y2="38" stroke="#38BDF8" strokeWidth="1.5" className="uh-flow-line" />
        <line x1="130" y1="38" x2="175" y2="16" stroke="#38BDF8" strokeWidth="1.5" className="uh-flow-line" />
        <line x1="175" y1="16" x2="225" y2="28" stroke="#10B981" strokeWidth="1.5" className="uh-flow-line" />
        <text x="130" y="11" fill="#94A3B8" fontFamily="JetBrains Mono" fontSize="7" textAnchor="middle">SYSTEM ARCHITECTURE PIPELINE</text>
      </svg>
    ),
  };
}

export function getInitials(name) {
  if (!name) return 'UH';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export { getBlueprintVisual };

export default function ProjectCard({ project }) {
  const navigate = useNavigate();
  const visual = getBlueprintVisual(project);
  const techList = Array.isArray(project.techStack) ? project.techStack.slice(0, 4) : [];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <article
      onClick={() => navigate(`/projects/${project._id}`)}
      onMouseMove={handleMouseMove}
      className="uh-bento-card uh-lift-card cursor-pointer flex flex-col justify-between group"
    >
      <div className="relative z-10">
        {/* Luminous Dribbble Blueprint Cover Header */}
        <div
          className={`h-44 px-5 py-4 bg-gradient-to-b ${visual.accent} border-b border-white/[0.08] flex flex-col justify-between relative overflow-hidden`}
        >
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-[#07080C]/80 text-sky-300 border border-sky-400/30">
              {project.branch || 'CSE'} · {project.year || '4th Year'}
            </span>
            <div className="flex items-center gap-2">
              {project.similarityScore !== undefined && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {project.similarityScore}% Match
                </span>
              )}
              <span className="text-[11px] font-mono text-slate-400">
                {project.views || 0} views
              </span>
            </div>
          </div>

          {/* Animated SVG System Diagram */}
          <div className="my-auto py-1">{visual.svg}</div>

          {/* Color-Coded Deliverable File Badges */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-rose-300 border-rose-500/30 bg-rose-500/10">
                Report.pdf
              </span>
              {(project.videoUrl || project.liveUrl) && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-sky-300 border-sky-500/30 bg-sky-500/10">
                  Demo.mp4
                </span>
              )}
              {(project.zipUrl || project.githubLink) && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border text-amber-300 border-amber-500/30 bg-amber-500/10">
                  {project.zipUrl ? 'Source.zip' : 'GitHub'}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {project.status === 'pending' ? 'Pending' : 'Approved'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors leading-snug line-clamp-2 m-0">
            {project.title}
          </h3>
          <p className="text-xs text-slate-300/90 mt-2 line-clamp-2 leading-relaxed mb-0">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {techList.map((tech, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/[0.06] text-slate-200 border border-white/[0.1]"
              >
                {tech}
              </span>
            ))}
            {Array.isArray(project.techStack) && project.techStack.length > 4 && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/[0.04] text-slate-400">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 px-5 py-3.5 border-t border-white/[0.08] bg-[#07080C]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-sky-500/20 border border-sky-400/30 text-[10px] font-bold text-sky-300 flex items-center justify-center">
            {getInitials(project.studentName)}
          </div>
          <span className="text-xs font-medium text-slate-200 truncate max-w-[140px]">
            {project.studentName || 'Student Author'}
          </span>
        </div>
        <span className="text-xs font-semibold text-sky-400 group-hover:text-sky-300 flex items-center gap-1">
          <span>Inspect Project</span>
          <svg
            className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </article>
  );
}

