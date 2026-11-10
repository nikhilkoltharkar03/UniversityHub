const { GoogleGenAI } = require('@google/genai');
const Project = require('../models/Project');

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generate embedding vector for text using Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} - Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: (text || "").replace(/\s+/g, " ").trim().substring(0, 10000)
    });
    const embeddingValues = result.embeddings ? result.embeddings[0].values : result.embedding.values;
    
    return embeddingValues;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {number} - Similarity score (0-1)
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Create searchable text from project
 * @param {Object} project - Project document
 * @returns {string} - Combined searchable text
 */
const createSearchableText = (project) => {
  return `${project.title} ${project.description} ${project.tags.join(' ')} ${project.techStack.join(' ')} ${project.branch} ${project.year}`;
};

/**
 * Generate and store embedding for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} - Success status
 */
const generateProjectEmbedding = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Create searchable text
    const searchableText = createSearchableText(project);
    
    // Generate embedding
    console.log(`Generating embedding for project: ${project.title}`);
    const embedding = await generateEmbedding(searchableText);
    
    // Store embedding in project
    project.embedding = embedding;
    await project.save();
    
    console.log(`✅ Embedding generated for: ${project.title}`);
    return true;
  } catch (error) {
    console.error(`Failed to generate embedding for project ${projectId}:`, error);
    return false;
  }
};

/**
 * Generate embeddings for all projects that don't have them
 * @returns {Promise<Object>} - Stats about embedding generation
 */
const generateAllEmbeddings = async () => {
  try {
    console.log('🔄 Starting batch embedding generation...');
    
    // Find projects without embeddings
    const projectsWithoutEmbeddings = await Project.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: null },
        { embedding: [] }
      ]
    });

    console.log(`Found ${projectsWithoutEmbeddings.length} projects without embeddings`);

    let successCount = 0;
    let failCount = 0;

    for (const project of projectsWithoutEmbeddings) {
      const success = await generateProjectEmbedding(project._id);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Batch embedding generation complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);

    return {
      total: projectsWithoutEmbeddings.length,
      success: successCount,
      failed: failCount
    };
  } catch (error) {
    console.error('Batch embedding generation error:', error);
    throw error;
  }
};

/**
 * Perform semantic search on projects
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters (branch, year, etc.)
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Array>} - Array of matching projects with similarity scores
 */
const semanticSearch = async (query, filters = {}, limit = 20) => {
  try {
    console.log(`🔍 Semantic search for: "${query}"`);

    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Build MongoDB query with filters
    let mongoQuery = { status: 'approved' };
    
    // Add optional filters
    if (filters.branch) {
      mongoQuery.branch = filters.branch;
    }
    if (filters.year) {
      mongoQuery.year = filters.year;
    }
    if (filters.techStack) {
      mongoQuery.techStack = { $in: [filters.techStack] };
    }

    // Find all projects with embeddings
    const projects = await Project.find({
      ...mongoQuery,
      embedding: { $exists: true, $ne: null, $not: { $size: 0 } }
    });

    console.log(`Found ${projects.length} projects with embeddings`);

    if (projects.length === 0) {
      return [];
    }

    // Calculate similarity for each project
    const projectsWithScores = projects.map(project => {
      const similarity = cosineSimilarity(queryEmbedding, project.embedding);
      
      return {
        ...project.toObject(),
        semanticScore: Math.round(similarity * 100), // Convert to percentage
        _relevance: similarity // For sorting
      };
    });

    // Sort by similarity (highest first) and limit results
    const sortedProjects = projectsWithScores
      .sort((a, b) => b._relevance - a._relevance)
      .slice(0, limit)
      .filter(p => p.semanticScore > 10); // Only show results with >10% relevance

    // Remove internal sorting field
    sortedProjects.forEach(p => delete p._relevance);

    console.log(`✅ Returning ${sortedProjects.length} semantic search results`);

    return sortedProjects;
  } catch (error) {
    console.error('Semantic search error:', error);
    throw error;
  }
};

/**
 * Hybrid search: Combines keyword and semantic search
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Combined search results
 */
const hybridSearch = async (query, filters = {}) => {
  try {
    console.log(`🔍 Hybrid search for: "${query}"`);

    // Perform both searches in parallel
    const [semanticResults, keywordResults] = await Promise.all([
      semanticSearch(query, filters, 10),
      performKeywordSearch(query, filters)
    ]);

    // Merge results (prioritize semantic, add keyword results not in semantic)
    const semanticIds = new Set(semanticResults.map(p => p._id.toString()));
    const uniqueKeywordResults = keywordResults.filter(
      p => !semanticIds.has(p._id.toString())
    );

    // Combine and limit to top 20
    const combinedResults = [
      ...semanticResults,
      ...uniqueKeywordResults.slice(0, 10)
    ].slice(0, 20);

    console.log(`✅ Hybrid search: ${semanticResults.length} semantic + ${uniqueKeywordResults.length} keyword = ${combinedResults.length} total`);

    return combinedResults;
  } catch (error) {
    console.error('Hybrid search error:', error);
    // Fallback to keyword search on error
    return await performKeywordSearch(query, filters);
  }
};

/**
 * Traditional keyword search (fallback)
 * @param {string} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Promise<Array>} - Keyword search results
 */
const performKeywordSearch = async (query, filters = {}) => {
  let mongoQuery = { status: 'approved' };
  
  if (filters.branch) mongoQuery.branch = filters.branch;
  if (filters.year) mongoQuery.year = filters.year;
  if (filters.techStack) mongoQuery.techStack = { $in: [filters.techStack] };

  const searchRegex = new RegExp(query, 'i');
  mongoQuery.$or = [
    { title: searchRegex },
    { description: searchRegex },
    { tags: { $in: [searchRegex] } },
    { techStack: { $in: [searchRegex] } }
  ];

  const projects = await Project.find(mongoQuery).limit(20);
  return projects.map(p => ({ ...p.toObject(), semanticScore: 0 }));
};

module.exports = {
  generateEmbedding,
  generateProjectEmbedding,
  generateAllEmbeddings,
  semanticSearch,
  hybridSearch,
  cosineSimilarity
};