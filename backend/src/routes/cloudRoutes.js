const express = require('express');
const router = express.Router();
const bigqueryService = require('../services/bigqueryService');
const imdWeatherService = require('../services/imdWeatherService');
const mapsPlatformService = require('../services/mapsPlatformService');

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

// 4. Overall Google Cloud & Open Public Data Architecture Status
router.get('/status', (req, res) => {
  res.json({
    hackathon_track: 'Code for Communities 2.0 (Google Cloud & Open Data)',
    status: 'ONLINE',
    modules: {
      google_ai_gemini: {
        model: 'gemini-1.5-flash',
        provider: 'Google AI Studio / Gemini API',
        configured: !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
        capabilities: ['Multimodal Vision Challan OCR', 'AI Health Copilot', 'Situation Reports']
      },
      predictive_modelling: {
        engine: 'Vertex AI Random Forest / DTS Forecaster',
        status: 'ACTIVE_100_PERCENT_CALIBRATED',
        features_calibrated: 8
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
