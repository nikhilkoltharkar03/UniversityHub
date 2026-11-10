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
 * Calculate simple text similarity (fallback method)
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score (0-1)
 */
const simpleTextSimilarity = (text1, text2) => {
  // Convert to lowercase and split into words
  const words1 = new Set(text1.toLowerCase().match(/\w+/g) || []);
  const words2 = new Set(text2.toLowerCase().match(/\w+/g) || []);
  
  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

/**
 * Check plagiarism for a project against all other projects
 * @param {string} projectId - Project ID to check
 * @returns {Promise<Object>} - Plagiarism analysis results
 */
const checkPlagiarism = async (projectId) => {
  try {
    console.log(`Starting plagiarism check for project: ${projectId}`);

    // Get the target project
    const targetProject = await Project.findById(projectId);
    if (!targetProject) {
      throw new Error('Project not found');
    }

    // Get all other approved projects (exclude the target project)
    const allProjects = await Project.find({
      _id: { $ne: projectId },
      status: 'approved'
    });

    if (allProjects.length === 0) {
      return {
        projectId,
        projectTitle: targetProject.title,
        overallScore: 0,
        riskLevel: 'low',
        matches: [],
        message: 'No other projects to compare against'
      };
    }

    console.log(`Comparing against ${allProjects.length} projects`);

    // Combine project text for analysis
    const targetText = `${targetProject.title} ${targetProject.description} ${targetProject.tags.join(' ')}`;

    let matches = [];
    let useEmbeddings = true;

    try {
      // Try embedding-based similarity first
      console.log('Generating embedding for target project...');
      const targetEmbedding = await generateEmbedding(targetText);

      for (const project of allProjects) {
        const compareText = `${project.title} ${project.description} ${project.tags.join(' ')}`;
        
        try {
          const compareEmbedding = await generateEmbedding(compareText);
          const similarityScore = cosineSimilarity(targetEmbedding, compareEmbedding);
          const similarityPercentage = Math.round(similarityScore * 100);

          if (similarityPercentage > 20) { // Only include if >20% similar
            matches.push({
              projectId: project._id,
              title: project.title,
              studentName: project.studentName,
              branch: project.branch,
              year: project.year,
              similarityScore: similarityPercentage,
              description: project.description.substring(0, 200) + '...',
              createdAt: project.createdAt
            });
          }
        } catch (err) {
          console.error(`Error comparing with project ${project._id}:`, err.message);
        }
      }
    } catch (embeddingError) {
      console.error('Embedding method failed, falling back to simple text similarity:', embeddingError);
      useEmbeddings = false;

      // Fallback to simple text similarity
      for (const project of allProjects) {
        const compareText = `${project.title} ${project.description} ${project.tags.join(' ')}`;
        const similarityScore = simpleTextSimilarity(targetText, compareText);
        const similarityPercentage = Math.round(similarityScore * 100);

        if (similarityPercentage > 20) {
          matches.push({
            projectId: project._id,
            title: project.title,
            studentName: project.studentName,
            branch: project.branch,
            year: project.year,
            similarityScore: similarityPercentage,
            description: project.description.substring(0, 200) + '...',
            createdAt: project.createdAt
          });
        }
      }
    }

    // Sort by similarity score (highest first)
    matches.sort((a, b) => b.similarityScore - a.similarityScore);

    // Calculate overall plagiarism score (highest match)
    const overallScore = matches.length > 0 ? matches[0].similarityScore : 0;

    // Determine risk level
    let riskLevel = 'low';
    if (overallScore >= 70) {
      riskLevel = 'high';
    } else if (overallScore >= 50) {
      riskLevel = 'medium';
    }

    console.log(`Plagiarism check complete. Overall score: ${overallScore}%, Risk: ${riskLevel}`);

    return {
      projectId,
      projectTitle: targetProject.title,
      overallScore,
      riskLevel,
      method: useEmbeddings ? 'embeddings' : 'text-similarity',
      matches: matches.slice(0, 5), // Return top 5 matches
      totalComparisons: allProjects.length,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Plagiarism check error:', error);
    throw error;
  }
};

/**
 * Compare two specific projects
 * @param {string} projectId1 - First project ID
 * @param {string} projectId2 - Second project ID
 * @returns {Promise<Object>} - Comparison result
 */
const compareProjects = async (projectId1, projectId2) => {
  try {
    const project1 = await Project.findById(projectId1);
    const project2 = await Project.findById(projectId2);

    if (!project1 || !project2) {
      throw new Error('One or both projects not found');
    }

    const text1 = `${project1.title} ${project1.description} ${project1.tags.join(' ')}`;
    const text2 = `${project2.title} ${project2.description} ${project2.tags.join(' ')}`;

    let similarityScore = 0;
    let method = 'text-similarity';

    try {
      // Try embeddings first
      const embedding1 = await generateEmbedding(text1);
      const embedding2 = await generateEmbedding(text2);
      similarityScore = cosineSimilarity(embedding1, embedding2);
      method = 'embeddings';
    } catch (error) {
      // Fallback to simple text similarity
      similarityScore = simpleTextSimilarity(text1, text2);
    }

    const similarityPercentage = Math.round(similarityScore * 100);

    return {
      project1: {
        id: project1._id,
        title: project1.title,
        description: project1.description
      },
      project2: {
        id: project2._id,
        title: project2.title,
        description: project2.description
      },
      similarityScore: similarityPercentage,
      method,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Project comparison error:', error);
    throw error;
  }
};

module.exports = {
  checkPlagiarism,
  compareProjects,
  generateEmbedding,
  cosineSimilarity
};