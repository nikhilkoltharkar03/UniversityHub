const { GoogleGenAI } = require('@google/genai');
const Project = require('../models/Project');
const pdfjsLib = require('pdfjs-dist/build/pdf.js');
const axios = require('axios');

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_PRIORITY = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-2.5-flash'
];

/**
 * Extract text from PDF buffer or URL
 * @param {Buffer|string} pdfSource - PDF buffer or URL
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromPDF = async (pdfSource) => {
  try {
    let pdfBuffer;

    // If it's a URL, fetch the PDF
    if (typeof pdfSource === 'string') {
      console.log('📥 Fetching PDF from URL...');
      const response = await axios.get(pdfSource, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      pdfBuffer = Buffer.from(response.data);
    } else {
      pdfBuffer = pdfSource;
    }

    console.log('📄 Parsing PDF...');
    console.log('PDF Buffer size:', pdfBuffer.length, 'bytes');
    
    // Parse PDF using unified pdfjs-dist
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
      disableFontFace: true
    });
    const pdfDoc = await loadingTask.promise;
    
    if (!pdfDoc || pdfDoc.numPages === 0) {
      throw new Error('No pages found in PDF');
    }
    
    // Extract text from all pages
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (pageText.length > 0) {
        fullText += pageText + '\n\n';
      }
    }
    
    const text = fullText.trim();
    console.log(`✅ Extracted ${text.length} characters from ${pdfDoc.numPages} pages`);
    
    if (text.length < 50) {
      console.warn('⚠️ Very little text extracted from PDF');
      return text || 'Could not extract meaningful text from PDF';
    }
    
    // ⭐ SMART EXTRACTION: Take from beginning, middle, and end
    if (text.length > 30000) {
      console.log(`📊 PDF is large (${text.length} chars), using smart extraction...`);
      
      // Extract key sections
      const beginning = text.substring(0, 12000);  // First ~12K chars (title, intro, abstract, problem statement)
      
      const middleStart = Math.floor(text.length * 0.35);
      const middle = text.substring(middleStart, middleStart + 12000); // Middle section (methodology, tech stack, implementation)
      
      const end = text.substring(Math.max(0, text.length - 6000));  // Last ~6K chars (results, conclusion, tech used)
      
      const smartExtract = `${beginning}\n\n[...MIDDLE SECTION...]\n\n${middle}\n\n[...CONCLUSION & REFERENCES...]\n\n${end}`;
      
      console.log(`✅ Smart extraction: ${smartExtract.length} characters (from ${text.length} total)`);
      console.log(`   - Beginning: 12,000 chars (intro, abstract, problem)`);
      console.log(`   - Middle: 12,000 chars (methodology, implementation)`);
      console.log(`   - End: 6,000 chars (results, conclusion)`);
      
      return smartExtract;
    }
    
    // If text is under 30K, use it all
    console.log(`📄 Using full PDF content (${text.length} characters)`);
    return text;
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Generate tags AND tech stack from project content
 * @param {Object} projectData - Project information
 * @param {string} pdfText - Optional extracted PDF text
 * @returns {Promise<Object>} - { tags: [], techStack: [] }
 */
const generateTagsAndTechStack = async (projectData, pdfText = null) => {
  try {
    const { title, description, techStack, branch, year } = projectData;

    // Use PDF text if available, otherwise use description
    const contentToAnalyze = pdfText || description || '';
    const contentLength = contentToAnalyze.length;
    const analysisLength = Math.min(contentLength, 35000);

    console.log(`🔍 Analyzing ${analysisLength} characters of content (${contentLength} total extracted)...`);

    // Create a comprehensive prompt for BOTH tags and tech stack
    const prompt = `
You are an expert at analyzing academic project documents and identifying technologies and relevant tags.

Analyze this project and generate:
1. A comprehensive list of technologies/tech stack used
2. Relevant project tags

PROJECT INFORMATION:
Title: ${title}
Branch: ${branch}
Year: ${year}
${techStack && techStack.length > 0 ? `Existing Tech Stack: ${techStack.join(', ')}` : ''}

PROJECT CONTENT/DESCRIPTION:
${contentToAnalyze.substring(0, 35000)}

TASK 1 - IDENTIFY TECHNOLOGIES:
Extract ALL technologies, frameworks, libraries, tools, languages, and platforms mentioned or implied.
Include:
- Programming Languages (Python, JavaScript, Java, etc.)
- Frameworks (React, Django, Flask, TensorFlow, etc.)
- Databases (MongoDB, MySQL, PostgreSQL, etc.)
- Cloud Services (AWS, Firebase, Azure, etc.)
- Tools & Libraries (OpenCV, Pandas, NumPy, etc.)
- Platforms (Android, iOS, Web, IoT, etc.)

TASK 2 - GENERATE RELEVANT TAGS:
Create 8-12 tags that describe:
- Project domain/category (e.g., "Machine-Learning", "Web-Development", "IoT")
- Key features (e.g., "Real-Time-Processing", "Cloud-Based", "Mobile-App")
- Application area (e.g., "Healthcare", "E-Commerce", "Education")
- Technical concepts (e.g., "Deep-Learning", "Microservices", "API-Integration")
- Academic context (e.g., "Capstone-Project", "Research-Based")

FORMAT RULES:
- Use Title-Case-With-Hyphens for tags (e.g., "Machine-Learning")
- Use proper capitalization for tech stack (e.g., "TensorFlow" not "tensorflow")
- Be specific and accurate
- Prioritize most important/relevant items first

OUTPUT FORMAT (STRICTLY FOLLOW):
TECH_STACK: technology1, technology2, technology3, ...
TAGS: Tag-One, Tag-Two, Tag-Three, ...

EXAMPLE OUTPUT:
TECH_STACK: Python, TensorFlow, Flask, OpenCV, NumPy, MongoDB, Firebase, React
TAGS: Computer-Vision, Deep-Learning, Real-Time-Detection, Web-Application, AI-Based-System, Image-Processing, Cloud-Integration, Academic-Project
`;

    let response = null;
    for (const modelName of MODEL_PRIORITY) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: prompt
        });
        response = result.text;
        if (response && response.length > 10) break;
      } catch (err) {
        continue;
      }
    }
    if (!response) throw new Error('All active Gemini models failed for auto-tagging');

    console.log('🤖 AI Response:', response);

    // Parse the response
    const techStackMatch = response.match(/TECH_STACK:\s*(.+)/i);
    const tagsMatch = response.match(/TAGS:\s*(.+)/i);

    let techStackArray = [];
    let tagsArray = [];

    if (techStackMatch) {
      techStackArray = techStackMatch[1]
        .split(',')
        .map(tech => tech.trim())
        .filter(tech => tech.length > 0)
        .map(tech => {
          // Clean up tech names
          return tech
            .replace(/['"`.]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        });
    }

    if (tagsMatch) {
      tagsArray = tagsMatch[1]
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => {
          // Clean up tags
          return tag
            .replace(/['"`.]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '')
            .trim();
        });
    }

    // Remove duplicates (case-insensitive)
    techStackArray = [...new Set(techStackArray.map(t => t))];
    tagsArray = [...new Set(tagsArray)];

    // Limit results
    techStackArray = techStackArray.slice(0, 15);
    tagsArray = tagsArray.slice(0, 12);

    console.log(`✅ Generated ${techStackArray.length} technologies and ${tagsArray.length} tags`);

    return {
      techStack: techStackArray,
      tags: tagsArray
    };

  } catch (error) {
    console.error('Tag and tech stack generation error:', error);
    // Return fallback
    return generateFallbackTagsAndTech(projectData);
  }
};

/**
 * Generate fallback tags and tech stack if AI fails
 * @param {Object} projectData - Project information
 * @returns {Object} - { tags: [], techStack: [] }
 */
const generateFallbackTagsAndTech = (projectData) => {
  const { techStack, branch, description, title } = projectData;
  const tags = new Set();
  const technologies = new Set();

  // Add existing tech stack
  if (techStack && techStack.length > 0) {
    techStack.forEach(tech => technologies.add(tech));
  }

  // Add branch-related tag
  if (branch) {
    tags.add(`${branch}-Engineering`);
  }

  // Analyze text for common technologies
  const text = `${title} ${description}`.toLowerCase();
  
  // Common tech patterns
  const techPatterns = {
    'Python': /\bpython\b/i,
    'JavaScript': /\bjavascript\b|\bjs\b/i,
    'React': /\breact\b/i,
    'Node.js': /\bnode\.?js\b/i,
    'MongoDB': /\bmongodb\b|\bmongo\b/i,
    'MySQL': /\bmysql\b/i,
    'TensorFlow': /\btensorflow\b/i,
    'Flask': /\bflask\b/i,
    'Django': /\bdjango\b/i,
    'HTML': /\bhtml\b/i,
    'CSS': /\bcss\b/i,
    'Firebase': /\bfirebase\b/i,
    'AWS': /\baws\b|\bamazon web services\b/i,
    'OpenCV': /\bopencv\b/i
  };

  Object.entries(techPatterns).forEach(([tech, pattern]) => {
    if (pattern.test(text)) {
      technologies.add(tech);
    }
  });

  // Add domain tags based on keywords
  if (text.includes('web') || text.includes('website')) tags.add('Web-Development');
  if (text.includes('mobile') || text.includes('app')) tags.add('Mobile-Development');
  if (text.includes('machine learning') || text.includes('ml')) tags.add('Machine-Learning');
  if (text.includes('ai') || text.includes('artificial intelligence')) tags.add('Artificial-Intelligence');
  if (text.includes('iot') || text.includes('internet of things')) tags.add('IoT');
  if (text.includes('blockchain')) tags.add('Blockchain');
  if (text.includes('cloud')) tags.add('Cloud-Computing');
  if (text.includes('security') || text.includes('cyber')) tags.add('Cybersecurity');
  if (text.includes('data') || text.includes('analytics')) tags.add('Data-Science');
  
  tags.add('Academic-Project');

  return {
    techStack: Array.from(technologies).slice(0, 10),
    tags: Array.from(tags).slice(0, 8)
  };
};

/**
 * Analyze PDF and generate tags + tech stack
 * @param {Buffer|string} pdfSource - PDF buffer or URL
 * @param {Object} basicInfo - Basic project info (title, branch, year)
 * @returns {Promise<Object>} - { tags: [], techStack: [], extractedText: string }
 */
const analyzeProjectPDF = async (pdfSource, basicInfo = {}) => {
  try {
    console.log('📄 Starting PDF analysis...');
    
    // Extract text from PDF
    const extractedText = await extractTextFromPDF(pdfSource);
    
    if (!extractedText || extractedText.length < 100) {
      throw new Error('Insufficient text extracted from PDF');
    }

    // Generate tags and tech stack from PDF content
    const result = await generateTagsAndTechStack(
      {
        title: basicInfo.title || 'Untitled Project',
        description: extractedText,
        techStack: [],
        branch: basicInfo.branch || '',
        year: basicInfo.year || ''
      },
      extractedText
    );

    console.log('✅ PDF analysis complete');
    
    return {
      ...result,
      extractedText: extractedText.substring(0, 1000) // Return first 1000 chars for reference
    };

  } catch (error) {
    console.error('PDF analysis error:', error);
    throw error;
  }
};

// Keep existing functions for backward compatibility
const generateTags = async (projectData) => {
  const result = await generateTagsAndTechStack(projectData);
  return result.tags;
};

const generateTagsForProject = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const projectData = {
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      branch: project.branch,
      year: project.year
    };

    const generatedTags = await generateTags(projectData);
    
    project.tags = generatedTags;
    await project.save();

    console.log(`✅ Tags generated and saved for: ${project.title}`);
    return generatedTags;

  } catch (error) {
    console.error(`Failed to generate tags for project ${projectId}:`, error);
    throw error;
  }
};

const generateTagsForAllProjects = async () => {
  try {
    console.log('🔄 Starting batch tag generation...');
    
    const projectsWithoutTags = await Project.find({
      $or: [
        { tags: { $exists: false } },
        { tags: { $size: 0 } },
        { tags: null }
      ]
    });

    console.log(`Found ${projectsWithoutTags.length} projects without tags`);

    let successCount = 0;
    let failCount = 0;

    for (const project of projectsWithoutTags) {
      try {
        const projectData = {
          title: project.title,
          description: project.description,
          techStack: project.techStack,
          branch: project.branch,
          year: project.year
        };

        const generatedTags = await generateTags(projectData);
        
        project.tags = generatedTags;
        await project.save();
        
        successCount++;
        console.log(`✅ [${successCount}/${projectsWithoutTags.length}] Tagged: ${project.title}`);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        failCount++;
        console.error(`❌ Failed to tag: ${project.title}`, error.message);
      }
    }

    console.log(`✅ Batch tag generation complete!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${failCount}`);

    return {
      total: projectsWithoutTags.length,
      success: successCount,
      failed: failCount
    };
  } catch (error) {
    console.error('Batch tag generation error:', error);
    throw error;
  }
};

const suggestAdditionalTags = async (projectId, count = 5) => {
  try {
    const project = await Project.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const projectData = {
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      branch: project.branch,
      year: project.year
    };

    const allTags = await generateTags(projectData);
    
    const existingTagsLower = project.tags.map(t => t.toLowerCase());
    const newTags = allTags.filter(tag => 
      !existingTagsLower.includes(tag.toLowerCase())
    );

    return newTags.slice(0, count);
  } catch (error) {
    console.error('Failed to suggest additional tags:', error);
    throw error;
  }
};

module.exports = {
  generateTags,
  generateTagsAndTechStack,
  generateTagsForProject,
  generateTagsForAllProjects,
  suggestAdditionalTags,
  analyzeProjectPDF,
  extractTextFromPDF
};