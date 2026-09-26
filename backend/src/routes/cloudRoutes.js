const express = require('express');
const router = express.Router();
const bigqueryService = require('../services/bigqueryService');
const imdWeatherService = require('../services/imdWeatherService');
const mapsPlatformService = require('../services/mapsPlatformService');
const vertexAIService = require('../services/vertexAIService');
const speechService = require('../services/speechService');

// 1. Google BigQuery Streaming Telemetry Buffer & Dataset
router.get('/bigquery/stream', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 25;
  res.json(bigqueryService.getStreamingBuffer(limit));
});

// 2. India Meteorological Department (IMD) Open Data Weather Outbreak Telemetry
router.get('/imd-weather/:districtId?', async (req, res, next) => {
  try {
    const districtId = req.params.districtId || 'DIST-JH-01';
    const weatherData = await imdWeatherService.getDistrictWeatherTelemetry(districtId);
    res.json(weatherData);
  } catch (err) {
    next(err);
  }
});

// 3. Google Maps Platform Route Analysis (Road Escrow vs ICMR Drone)
router.post('/maps/route-analysis', async (req, res, next) => {
  try {
    const { sourceLat, sourceLon, destLat, destLon, payloadKg } = req.body;
    const analysis = await mapsPlatformService.computeRouteAnalysis({
      sourceLat: parseFloat(sourceLat) || 23.3600,
      sourceLon: parseFloat(sourceLon) || 85.3250,
      destLat: parseFloat(destLat) || 23.3200,
      destLon: parseFloat(destLon) || 85.3800,
      payloadKg: parseFloat(payloadKg) || 2.0
    });
    res.json(analysis);
  } catch (err) {
    next(err);
  }
});

// 4. Google Cloud Vertex AI: Days-to-Stockout (DTS) Prediction
router.post('/vertex/predict-dts', async (req, res, next) => {
  try {
    const prediction = await vertexAIService.predictDaysToStockout(req.body);
    res.json(prediction);
  } catch (err) {
    next(err);
  }
});

// 4b. Google Cloud Vertex AI: Big Data Batch Evaluation (Multi-Facility & District Scale)
router.post('/vertex/predict-batch', async (req, res, next) => {
  try {
    const batchPrediction = await vertexAIService.predictBatchStockout(req.body);
    res.json(batchPrediction);
  } catch (err) {
    next(err);
  }
});

// 5. Google Cloud Vertex AI: Cold-Chain Thermal Spoilage Prediction
router.post('/vertex/predict-spoilage', async (req, res, next) => {
  try {
    const prediction = await vertexAIService.predictThermalSpoilageRisk(req.body);
    res.json(prediction);
  } catch (err) {
    next(err);
  }
});

// 6. Google Cloud Speech-to-Text v2: Vernacular Voice Transcription
router.post('/voice/transcribe', async (req, res, next) => {
  try {
    const { audioBase64, languageCode, encoding, sampleRateHertz } = req.body;
    const transcription = await speechService.transcribeAudio({
      audioBase64,
      languageCode: languageCode || 'hi-IN',
      encoding,
      sampleRateHertz
    });
    res.json(transcription);
  } catch (err) {
    next(err);
  }
});

// 7. Google Cloud Translation API v2: Regional Language Translation
router.post('/voice/translate', async (req, res, next) => {
  try {
    const { text, sourceLanguage, targetLanguage } = req.body;
    const translation = await speechService.translateText({
      text,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage: targetLanguage || 'en'
    });
    res.json(translation);
  } catch (err) {
    next(err);
  }
});

// 8. Supported Vernacular Languages
router.get('/voice/languages', (req, res) => {
  res.json({
    languages: speechService.getSupportedLanguages()
  });
});

// 9. Overall Google Cloud & Open Public Data Architecture Status
router.get('/status', (req, res) => {
  res.json({
    hackathon_track: 'Code for Communities 2.0 (Google Cloud & Open Data)',
    status: 'ONLINE',
    modules: {
      google_ai_gemini: {
        model: 'gemini-2.5-flash',
        provider: 'Google AI Studio / Gemini API',
        configured: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
        capabilities: ['Multimodal Vision Challan OCR', 'AI Health Copilot', 'Situation Reports']
      },
      predictive_modelling_vertex_ai: {
        engine: 'Vertex AI Model Serving (asia-south1)',
        endpoint: 'projects/arogyagrid-national/locations/asia-south1/endpoints/arogyagrid-dts-endpoint-v1',
        status: 'ACTIVE_AND_INTEGRATED',
        explainability: 'SHAP Feature Attribution (XAI)',
        features_calibrated: 8
      },
      language_and_voice: {
        provider: 'Google Cloud Speech-to-Text v2 & Cloud Translation API',
        status: 'ACTIVE_AND_INTEGRATED',
        supported_dialects: ['hi-IN (Hindi)', 'bho-IN (Bhojpuri)', 'mr-IN (Marathi)', 'or-IN (Odia)', 'ta-IN (Tamil)', 'bn-IN (Bengali)', 'en-IN (English)'],
        multimodal_fallback: 'Gemini 1.5 Flash Audio'
      },
      geospatial_logistics: {
        provider: 'Google Maps Platform',
        layers: ['Roadmap (lyrs=m)', 'Satellite Hybrid (lyrs=y)', 'Terrain (lyrs=p)'],
        drone_corridors_active: true
      },
      bigquery_analytics: {
        dataset: 'arogyagrid_analytics.stock_transactions',
        gcp_connected: bigqueryService.isGcpConnected,
        streaming_buffer_size: bigqueryService.streamBuffer.length
      },
      open_public_data: {
        providers: ['data.gov.in', 'India Meteorological Department (IMD)', 'WHO EML', 'NLEM-2022', 'ABDM FHIR R4']
      }
    }
  });
});

module.exports = router;
