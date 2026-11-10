const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },

  // Student Info
  userId: {
    type: String,
    trim: true
  },
  studentName: {
    type: String,
    required: true
  },
  studentEmail: {
    type: String,
    required: true
  },

  // Academic Details
  branch: {
    type: String,
    required: true,
    enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'Other']
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
  },

  // Tech Details
  techStack: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],

  // Links
  githubLink: {
    type: String,
    trim: true
  },
  liveUrl: {
    type: String,
    trim: true
  },

  // Files (encrypted URLs)
  pdfUrl: {
    type: String,
    encrypted: true
  },
  videoUrl: {
    type: String,
    encrypted: true
  },
  // ZIP file URL (stored as plain URL from R2)
  zipUrl: {
    type: String,
    default: null
  },

  // NLP Generated Summary
  aiSummary: {
    type: String,
    default: ''
  },

  // Semantic Search Embedding
  embedding: {
    type: [Number],
    default: null
  },

  // Feature 2: RAG Copilot Cached PDF Text, Mermaid Architecture & Quantitative Metrics
  extractedText: {
    type: String,
    default: null
  },
  architectureDiagram: {
    type: String,
    default: null
  },
  copilotMetrics: {
    faithfulnessScore: { type: Number, default: null },
    relevanceScore: { type: Number, default: null },
    hallucinationRate: { type: Number, default: 0 },
    diagramNodeCount: { type: Number, default: 0 },
    diagramEdgeCount: { type: Number, default: 0 },
    entityCoverageScore: { type: Number, default: 0 },
    questionsAnswered: { type: Number, default: 0 },
    avgLatencyMs: { type: Number, default: 0 },
    lastEvaluated: { type: Date, default: null }
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Admin Actions
  approvedBy: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },

  // Metadata
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ branch: 1, year: 1 });
projectSchema.index({ tags: 1 });
projectSchema.index({ userId: 1 });
projectSchema.index({ studentEmail: 1 });

module.exports = mongoose.model('Project', projectSchema);
