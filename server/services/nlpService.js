const { spawn } = require('child_process');
const path = require('path');

/**
 * Generate summary using Python NLP service
 * @param {string} text - Text to summarize
 * @returns {Promise<string>} - Generated summary
 */
const generateSummary = (text) => {
  return new Promise((resolve, reject) => {
    // Path to Python script
    const pythonScript = path.join(__dirname, '../nlp/summarizer.py');
    
    // Spawn Python process
    const pythonProcess = spawn('python', [pythonScript, text]);
    
    let output = '';
    let errorOutput = '';
    
    // Collect output
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    // Collect errors
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python process error:', errorOutput);
        // Fallback: return first 2 sentences
        const fallbackSummary = text.split('.').slice(0, 2).join('.') + '.';
        return resolve(fallbackSummary);
      }
      
      try {
        const result = JSON.parse(output);
        
        if (result.error) {
          console.error('NLP error:', result.error);
          // Fallback: return first 2 sentences
          const fallbackSummary = text.split('.').slice(0, 2).join('.') + '.';
          return resolve(fallbackSummary);
        }
        
        resolve(result.summary);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        // Fallback: return first 2 sentences
        const fallbackSummary = text.split('.').slice(0, 2).join('.') + '.';
        resolve(fallbackSummary);
      }
    });
    
    // Handle process errors
    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      // Fallback: return first 2 sentences
      const fallbackSummary = text.split('.').slice(0, 2).join('.') + '.';
      resolve(fallbackSummary);
    });
  });
};

module.exports = { generateSummary };