import sys
import json
from transformers import pipeline

# Initialize the summarization pipeline
# This loads the pre-trained BART model
try:
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
except Exception as e:
    print(json.dumps({"error": f"Failed to load model: {str(e)}"}))
    sys.exit(1)

def generate_summary(text, max_length=80, min_length=30):
    """
    Generate a concise summary from the input text
    
    Args:
        text (str): Input text to summarize
        max_length (int): Maximum length of summary
        min_length (int): Minimum length of summary
    
    Returns:
        str: Generated summary
    """
    try:
        # Clean and prepare text
        text = text.strip()
        
        # If text is too short, return as-is
        if len(text.split()) < 50:
            return text
        
        # Generate summary
        summary = summarizer(
            text,
            max_length=max_length,
            min_length=min_length,
            do_sample=False
        )
        
        return summary[0]['summary_text']
    
    except Exception as e:
        # If summarization fails, return first 2-3 sentences
        sentences = text.split('.')[:2]
        return '.'.join(sentences) + '.'

if __name__ == "__main__":
    # Read input from Node.js
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No input text provided"}))
        sys.exit(1)
    
    input_text = sys.argv[1]
    
    try:
        summary = generate_summary(input_text)
        print(json.dumps({"summary": summary}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)