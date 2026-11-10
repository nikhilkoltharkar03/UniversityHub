import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getUserProfileData } from '../utils/userHelpers';
import axios from 'axios';

function Upload() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    branch: 'CSE',
    year: '4th Year',
    techStack: '',
    tags: '',
    githubLink: '',
    liveUrl: '',
  });

  const [files, setFiles] = useState({
    pdf: null,
    video: null,
    zip: null,
  });

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });

  // PDF Auto-Fill state
  const [analyzingPDF, setAnalyzingPDF] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({
    techStack: [],
    tags: [],
  });
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      if (name === 'zip') {
        const fileSizeMB = selectedFiles[0].size / (1024 * 1024);
        if (fileSizeMB > 500) {
          setMessage({
            type: 'error',
            text: `ZIP file is too large (${fileSizeMB.toFixed(2)} MB). Maximum size is 500 MB.`,
          });
          return;
        }
      }

      setFiles((prev) => ({
        ...prev,
        [name]: selectedFiles[0],
      }));

      if (message.type === 'error') {
        setMessage({ type: '', text: '' });
      }
    }
  };

  const handleAnalyzePDF = async () => {
    if (!files.pdf) {
      setMessage({
        type: 'error',
        text: 'Please select a project report (PDF) file first.',
      });
      return;
    }

    if (!formData.title.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a project title on the right before extracting tags.',
      });
      return;
    }

    try {
      setAnalyzingPDF(true);
      const formDataToSend = new FormData();
      formDataToSend.append('pdf', files.pdf);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('branch', formData.branch);
      formDataToSend.append('year', formData.year);

      const response = await axios.post(
        'http://localhost:5000/api/projects/analyze-pdf',
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data?.success) {
        setAiSuggestions({
          techStack: response.data.techStack || [],
          tags: response.data.tags || [],
        });
        setShowAISuggestions(true);
        setMessage({
          type: 'success',
          text: `Extracted ${response.data.techStack?.length || 0} technologies and ${response.data.tags?.length || 0} domain tags from ${files.pdf.name}.`,
        });
      }
    } catch (error) {
      console.error('PDF analysis failed:', error);
      setMessage({
        type: 'error',
        text: 'Could not extract tags from PDF automatically. You can still enter them manually.',
      });
    } finally {
      setAnalyzingPDF(false);
    }
  };

  const handleAddSuggestedTech = (tech) => {
    const currentTechs = formData.techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTechs.includes(tech)) {
      setFormData((prev) => ({
        ...prev,
        techStack: [...currentTechs, tech].join(', '),
      }));
    }
  };

  const handleAddAllTech = () => {
    const currentTechs = formData.techStack
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const merged = [...new Set([...currentTechs, ...aiSuggestions.techStack])];
    setFormData((prev) => ({
      ...prev,
      techStack: merged.join(', '),
    }));
  };

  const handleAddSuggestedTag = (tag) => {
    const currentTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...currentTags, tag].join(', '),
      }));
    }
  };

  const handleAddAllTags = () => {
    const currentTags = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const merged = [...new Set([...currentTags, ...aiSuggestions.tags])];
    setFormData((prev) => ({
      ...prev,
      tags: merged.join(', '),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    setMessage({ type: '', text: '' });

    try {
      const userProfile = getUserProfileData(currentUser);
      const submitData = new FormData();

      submitData.append('userId', currentUser.uid);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('studentName', userProfile.displayName);
      submitData.append('studentEmail', currentUser.email);
      submitData.append(
        'branch',
        userProfile.branch !== 'N/A' ? userProfile.branch : formData.branch
      );
      submitData.append(
        'year',
        userProfile.year !== 'N/A' ? userProfile.year : formData.year
      );
      submitData.append(
        'techStack',
        JSON.stringify(
          formData.techStack
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );
      submitData.append(
        'tags',
        JSON.stringify(
          formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        )
      );

      if (formData.githubLink)
        submitData.append('githubLink', formData.githubLink);
      if (formData.liveUrl) submitData.append('liveUrl', formData.liveUrl);

      if (files.pdf) submitData.append('pdf', files.pdf);
      if (files.video) submitData.append('video', files.video);
      if (files.zip) submitData.append('zip', files.zip);

      const response = await axios.post(
        'http://localhost:5000/api/projects',
        submitData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data?.success) {
        setMessage({
          type: 'success',
          text: 'Project submitted for faculty approval! Redirecting to your submissions...',
        });

        setTimeout(() => navigate('/dashboard'), 1800);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({
        type: 'error',
        text:
          error.response?.data?.message ||
          'Failed to submit project. Please verify your inputs and try again.',
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full">
      <div className="mb-7">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight m-0">
          Submit Your Project
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-0">
          Upload your project report (PDF) first to auto-fill technologies and
          check for duplicate topics.
        </p>
      </div>

      {/* Status Alert Banner */}
      {message.text && (
        <div
          className={`uh-bento-card p-4 mb-6 text-xs flex items-center justify-between ${
            message.type === 'error'
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
              : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          <span className="relative z-10">{message.text}</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="relative z-10 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Progress Bar */}
      {loading && uploadProgress > 0 && (
        <div className="uh-bento-card p-4 mb-6">
          <div className="relative z-10">
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Uploading project deliverables...</span>
              <span className="font-mono text-sky-400">{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): PDF Dropzone & Deliverables */}
        <div className="lg:col-span-5 space-y-5">
          <div className="uh-bento-card p-5">
            <div className="relative z-10">
              <h2 className="text-sm font-bold text-white mb-1">
                1. Project Report (PDF)
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Upload your documentation to extract tech tags automatically.
              </p>

              {/* Uiverse Interactive Dropzone */}
              <label className="uh-uiverse-dropzone rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer block m-0">
                <input
                  type="file"
                  name="pdf"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="w-10 h-10 rounded-full bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 mb-3">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-white">
                  {files.pdf
                    ? `Selected: ${files.pdf.name}`
                    : 'Click to select Report.pdf'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {files.pdf
                    ? `${(files.pdf.size / 1024 / 1024).toFixed(2)} MB`
                    : 'PDF up to 50 MB'}
                </span>
              </label>

              <button
                type="button"
                onClick={handleAnalyzePDF}
                disabled={analyzingPDF || !files.pdf}
                className="uh-btn-secondary w-full mt-4 disabled:opacity-50"
              >
                <span>
                  {analyzingPDF
                    ? 'Scanning Report PDF...'
                    : 'Extract Tech Stack from PDF'}
                </span>
              </button>

              {/* Extracted Suggestions Box */}
              {showAISuggestions &&
                (aiSuggestions.techStack.length > 0 ||
                  aiSuggestions.tags.length > 0) && (
                  <div className="mt-4 p-3.5 rounded-xl bg-[#07080C] border border-emerald-500/40 space-y-3">
                    {aiSuggestions.techStack.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-2">
                          <span>Detected Technologies:</span>
                          <button
                            type="button"
                            onClick={handleAddAllTech}
                            className="underline hover:text-white"
                          >
                            + Add All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {aiSuggestions.techStack.map((tech, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddSuggestedTech(tech)}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] hover:bg-emerald-500/20 text-slate-200 border border-white/10"
                            >
                              + {tech}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiSuggestions.tags.length > 0 && (
                      <div className="pt-2 border-t border-white/[0.08]">
                        <div className="flex items-center justify-between text-[11px] font-mono text-sky-400 mb-2">
                          <span>Suggested Domain Tags:</span>
                          <button
                            type="button"
                            onClick={handleAddAllTags}
                            className="underline hover:text-white"
                          >
                            + Add All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {aiSuggestions.tags.map((tag, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleAddSuggestedTag(tag)}
                              className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/[0.06] hover:bg-sky-500/20 text-slate-200 border border-white/10"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div className="uh-bento-card p-5 space-y-4">
            <div className="relative z-10">
              <label className="block text-xs font-semibold text-white mb-1">
                Demo Video (MP4 / WebM)
              </label>
              <input
                type="file"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/15 file:text-sky-300 hover:file:bg-sky-500/25"
              />
              {files.video && (
                <span className="text-[11px] font-mono text-emerald-400 block mt-1">
                  ✓ {files.video.name}
                </span>
              )}
            </div>
            <div className="relative z-10 pt-3 border-t border-white/[0.08]">
              <label className="block text-xs font-semibold text-white mb-1">
                Source Code Archive (.ZIP)
              </label>
              <input
                type="file"
                name="zip"
                accept=".zip"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/15 file:text-sky-300 hover:file:bg-sky-500/25"
              />
              {files.zip && (
                <span className="text-[11px] font-mono text-emerald-400 block mt-1">
                  ✓ {files.zip.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Project Information Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="uh-bento-card p-6 space-y-4"
          >
            <div className="relative z-10 space-y-4">
              <h2 className="text-sm font-bold text-white mb-2">
                2. Project Information
              </h2>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Autonomous Solar-Powered Quadcopter"
                  className="w-full bg-[#07080C]/90 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Department / Branch *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#07080C]/90 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none"
                  >
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="IT">Information Technology (IT)</option>
                    <option value="ECE">Electronics & Comm. (ECE)</option>
                    <option value="EEE">Electrical Engineering (EEE)</option>
                    <option value="MECH">Mechanical Engineering (MECH)</option>
                    <option value="CIVIL">Civil Engineering (CIVIL)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Academic Year *
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#07080C]/90 text-xs text-white rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none"
                  >
                    <option value="4th Year">4th Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="1st Year">1st Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Abstract / Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  placeholder="Explain the problem statement, methodology, and results achieved..."
                  className="w-full bg-[#07080C]/90 text-xs text-white rounded-xl p-3.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Technologies Used (comma-separated) *
                </label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleChange}
                  required
                  placeholder="React, Node.js, Python, OpenCV..."
                  className="w-full bg-[#07080C]/90 text-xs text-white font-mono rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Domain Keywords / Tags (comma-separated) *
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  required
                  placeholder="robotics, computer vision, iot..."
                  className="w-full bg-[#07080C]/90 text-xs text-white font-mono rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    GitHub Repository URL
                  </label>
                  <input
                    type="url"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleChange}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-[#07080C]/90 text-xs text-white font-mono rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Live Demo URL (optional)
                  </label>
                  <input
                    type="url"
                    name="liveUrl"
                    value={formData.liveUrl}
                    onChange={handleChange}
                    placeholder="https://project-demo.vercel.app"
                    className="w-full bg-[#07080C]/90 text-xs text-white font-mono rounded-xl px-3.5 py-2.5 border border-white/[0.1] focus:outline-none focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/projects')}
                  className="uh-btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="uh-btn-primary disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit for Approval'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Upload;
