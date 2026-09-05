require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'arogyagrid_super_secret_jwt_key_2026',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arogyagrid',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000',
  OLA_MAPS_API_KEY: process.env.OLA_MAPS_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};
