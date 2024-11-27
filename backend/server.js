import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { transcribeVideo } from './transcribeVideo.js';

const PORT = process.env.PORT || 5000;

// Configure dotenv
dotenv.config();

const app = express();  

app.use(express.json());

const corsOptions = {
    origin: process.env.CORS_ORIGIN, 
  };

  app.use(cors(corsOptions));  

// Environment checks
if (!process.env.PORT) {
  throw new Error('Missing required PORT in environment variables.');
}


// Routes
app.post('/transcribe', async (req, res) => {
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
    console.log("Response Sent to frontend")
    return res.json({ summaryData, sentimentData, aiAnalysisData, lineChartAnalysis, pieChartAnalysis });

  } catch (error) {
    console.error('Error during analysis:', error);

    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});