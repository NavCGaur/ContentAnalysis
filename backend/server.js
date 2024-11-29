import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { transcribeVideo } from './transcribeVideo.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin: ['https://content-analysis-swart.vercel.app', process.env.CORS_ORIGIN || '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Debug: Log environment variables
console.log('CORS Origin:', process.env.CORS_ORIGIN);

// POST Route: Transcription
app.post('/transcribe', async (req, res) => {
  console.log('Received request:', req.body);

  const { videoUrl } = req.body;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    const response = await transcribeVideo(videoUrl);

    const result = response.transcription;
    const aiAnalysisData = response.analysis;
    const lineChartAnalysis = response.lineChartAnalysis;
    const pieChartAnalysis = response.pieChartAnalysis;

    const summaryData = result.summary;

    // Prepare sentiment data for chart
    const sentimentData = [];
    let score = 0;

    result.sentiment_analysis_results.forEach((sentiment) => {
      if (sentiment.sentiment === 'POSITIVE') {
        score += 1;
      } else if (sentiment.sentiment === 'NEGATIVE') {
        score -= 1;
      }
      sentimentData.push({
        timestamp: sentiment.start / 1000, // Convert ms to seconds
        score,
      });
    });

    console.log('Response sent to frontend');
    return res.json({
      summaryData,
      sentimentData,
      aiAnalysisData,
      lineChartAnalysis,
      pieChartAnalysis,
    });
  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
