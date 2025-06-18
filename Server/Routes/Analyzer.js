const express = require('express');
const router = express.Router();

// Simple sentiment analysis function
const analyzeSentiment = (text) => {
  const lowerText = text.toLowerCase();
  
  // Positive words
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'perfect',
    'love', 'like', 'enjoy', 'happy', 'satisfied', 'pleased', 'impressed', 'helpful',
    'useful', 'effective', 'efficient', 'fast', 'quick', 'easy', 'simple', 'intuitive',
    'beautiful', 'nice', 'clean', 'modern', 'smooth', 'reliable', 'stable', 'secure'
  ];
  
  // Negative words
  const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'frustrating',
    'hate', 'dislike', 'annoying', 'irritating', 'confusing', 'difficult', 'hard',
    'slow', 'buggy', 'broken', 'crash', 'error', 'problem', 'issue', 'bug',
    'ugly', 'messy', 'complicated', 'unreliable', 'unstable', 'insecure', 'poor'
  ];
  
  // Count positive and negative words
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      positiveCount += matches.length;
    }
  });
  
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches) {
      negativeCount += matches.length;
    }
  });
  
  // Calculate sentiment score
  const totalWords = positiveCount + negativeCount;
  let sentiment = 'neutral';
  let score = 0.5;
  
  if (totalWords > 0) {
    score = positiveCount / totalWords;
    
    if (score > 0.6) {
      sentiment = 'positive';
    } else if (score < 0.4) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
  }
  
  // Boost sentiment based on exclamation marks and caps
  const exclamationCount = (text.match(/!/g) || []).length;
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  
  if (exclamationCount > 2 || capsCount > text.length * 0.3) {
    if (sentiment === 'positive') {
      score = Math.min(1, score + 0.1);
    } else if (sentiment === 'negative') {
      score = Math.max(0, score - 0.1);
    }
  }
  
  return {
    sentiment: sentiment,
    score: score,
    positiveWords: positiveCount,
    negativeWords: negativeCount,
    totalWords: totalWords
  };
};

// Sentiment analysis endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a string'
      });
    }
    
    const analysis = analyzeSentiment(text);
    
    res.json({
      success: true,
      text: text,
      sentiment: analysis.sentiment,
      score: analysis.score,
      details: {
        positiveWords: analysis.positiveWords,
        negativeWords: analysis.negativeWords,
        totalWords: analysis.totalWords
      }
    });
    
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing sentiment',
      error: error.message
    });
  }
});

// Batch sentiment analysis endpoint
router.post('/analyze-batch', async (req, res) => {
  try {
    const { texts } = req.body;
    
    if (!Array.isArray(texts)) {
      return res.status(400).json({
        success: false,
        message: 'Texts must be an array'
      });
    }
    
    const results = texts.map(text => ({
      text: text,
      ...analyzeSentiment(text)
    }));
    
    res.json({
      success: true,
      results: results
    });
    
  } catch (error) {
    console.error('Error in batch sentiment analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing sentiments',
      error: error.message
    });
  }
});

module.exports = router;