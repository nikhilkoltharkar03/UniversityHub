const Project = require('../models/Project');

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
 * Calculate Jaccard similarity for tech stacks
 * @param {Array} techStack1 - First tech stack
 * @param {Array} techStack2 - Second tech stack
 * @returns {number} - Similarity score (0-1)
 */
const jaccardSimilarity = (techStack1, techStack2) => {
  const set1 = new Set(techStack1.map(t => t.toLowerCase()));
  const set2 = new Set(techStack2.map(t => t.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

/**
 * Get content-based recommendations using embeddings
 * @param {string} projectId - Source project ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} - Recommended projects
 */
const getContentBasedRecommendations = async (projectId, limit = 5) => {
  try {
    // Get source project
    const sourceProject = await Project.findById(projectId);
    if (!sourceProject || !sourceProject.embedding) {
      return [];
    }

    // Find all other approved projects with embeddings
    const allProjects = await Project.find({
      _id: { $ne: projectId },
      status: 'approved',
      embedding: { $exists: true, $ne: null, $not: { $size: 0 } }
    });

    if (allProjects.length === 0) {
      return [];
    }

    // Calculate similarity scores
    const projectsWithScores = allProjects.map(project => {
      const similarity = cosineSimilarity(sourceProject.embedding, project.embedding);
      
      return {
        ...project.toObject(),
        similarityScore: Math.round(similarity * 100),
        recommendationType: 'content'
      };
    });

    // Sort by similarity and limit
    const recommendations = projectsWithScores
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit)
      .filter(p => p.similarityScore > 20); // Only recommend if >20% similar

    return recommendations;
  } catch (error) {
    console.error('Content-based recommendation error:', error);
    return [];
  }
};

/**
 * Get tech stack based recommendations
 * @param {string} projectId - Source project ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} - Recommended projects
 */
const getTechStackRecommendations = async (projectId, limit = 5) => {
  try {
    const sourceProject = await Project.findById(projectId);
    if (!sourceProject) {
      return [];
    }

    // ⭐ FIX: Normalize tech stack to lowercase for comparison
    const sourceTechNormalized = sourceProject.techStack.map(t => t.toLowerCase().trim());

    console.log(`Source tech stack (normalized):`, sourceTechNormalized);

    // Find ALL approved projects (except source)
    const allProjects = await Project.find({
      _id: { $ne: projectId },
      status: 'approved'
    });

    console.log(`Found ${allProjects.length} projects to compare tech stacks`);

    if (allProjects.length === 0) {
      return [];
    }

    // ⭐ FIX: Manually calculate Jaccard similarity with case-insensitive comparison
    const projectsWithScores = allProjects
      .map(project => {
        const projectTechNormalized = project.techStack.map(t => t.toLowerCase().trim());
        const similarity = jaccardSimilarity(sourceTechNormalized, projectTechNormalized);
        
        return {
          ...project.toObject(),
          similarityScore: Math.round(similarity * 100),
          recommendationType: 'techStack',
          matchingTechs: sourceTechNormalized.filter(t => projectTechNormalized.includes(t))
        };
      })
      .filter(p => p.similarityScore > 0); // ⭐ FIX: Changed from 15 to 0 to include any overlap

    // Sort and limit
    const recommendations = projectsWithScores
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);

    console.log(`Tech stack recommendations found: ${recommendations.length}`);
    if (recommendations.length > 0) {
      console.log(`Top match: ${recommendations[0].title} (${recommendations[0].similarityScore}% - ${recommendations[0].matchingTechs.join(', ')})`);
    }

    return recommendations;
  } catch (error) {
    console.error('Tech stack recommendation error:', error);
    return [];
  }
};

/**
 * Get recommendations from same branch/domain
 * @param {string} projectId - Source project ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} - Recommended projects
 */
const getSameDomainRecommendations = async (projectId, limit = 5) => {
  try {
    const sourceProject = await Project.findById(projectId);
    if (!sourceProject) {
      return [];
    }

    // Find projects from same branch, prefer same year
    const sameYearProjects = await Project.find({
      _id: { $ne: projectId },
      status: 'approved',
      branch: sourceProject.branch,
      year: sourceProject.year
    }).limit(limit);

    // If not enough, get from same branch different years
    if (sameYearProjects.length < limit) {
      const sameBranchProjects = await Project.find({
        _id: { $ne: projectId },
        status: 'approved',
        branch: sourceProject.branch,
        year: { $ne: sourceProject.year }
      }).limit(limit - sameYearProjects.length);

      const combined = [...sameYearProjects, ...sameBranchProjects];
      
      return combined.map(project => ({
        ...project.toObject(),
        similarityScore: project.year === sourceProject.year ? 90 : 70,
        recommendationType: 'domain'
      }));
    }

    return sameYearProjects.map(project => ({
      ...project.toObject(),
      similarityScore: 90,
      recommendationType: 'domain'
    }));
  } catch (error) {
    console.error('Same domain recommendation error:', error);
    return [];
  }
};

/**
 * Get hybrid recommendations (combines all methods)
 * @param {string} projectId - Source project ID
 * @returns {Promise<Object>} - Categorized recommendations
 */
const getHybridRecommendations = async (projectId) => {
  try {
    console.log(`🎯 Generating recommendations for project: ${projectId}`);

    // Run all recommendation methods in parallel
    const [contentBased, techStackBased, domainBased] = await Promise.all([
      getContentBasedRecommendations(projectId, 6),
      getTechStackRecommendations(projectId, 6),
      getSameDomainRecommendations(projectId, 6)
    ]);

    // ⭐ FIX: Don't remove duplicates - let projects appear in multiple categories!
    // This is intentional - a project can be similar in BOTH content AND tech stack
    const uniqueContentBased = contentBased;
    const uniqueTechStack = techStackBased;
    const uniqueDomainBased = domainBased;

    console.log(`✅ Recommendations generated:`);
    console.log(`   Similar Projects: ${uniqueContentBased.length}`);
    console.log(`   Similar Tech Stack: ${uniqueTechStack.length}`);
    console.log(`   Same Domain: ${uniqueDomainBased.length}`);

    return {
      similarProjects: uniqueContentBased.slice(0, 5),
      techStackMatches: uniqueTechStack.slice(0, 5),
      sameDomain: uniqueDomainBased.slice(0, 5)
    };
  } catch (error) {
    console.error('Hybrid recommendation error:', error);
    throw error;
  }
};

/**
 * Get simple recommendations (fallback when embeddings not available)
 * @param {string} projectId - Source project ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} - Recommended projects
 */
const getSimpleRecommendations = async (projectId, limit = 8) => {
  try {
    const sourceProject = await Project.findById(projectId);
    if (!sourceProject) {
      return [];
    }

    // Get projects: same branch > overlapping tech > recent
    const recommendations = await Project.find({
      _id: { $ne: projectId },
      status: 'approved',
      $or: [
        { branch: sourceProject.branch },
        { techStack: { $in: sourceProject.techStack } }
      ]
    })
    .sort({ views: -1, createdAt: -1 })
    .limit(limit);

    return recommendations.map(project => ({
      ...project.toObject(),
      similarityScore: 0,
      recommendationType: 'simple'
    }));
  } catch (error) {
    console.error('Simple recommendation error:', error);
    return [];
  }
};

module.exports = {
  getContentBasedRecommendations,
  getTechStackRecommendations,
  getSameDomainRecommendations,
  getHybridRecommendations,
  getSimpleRecommendations
};