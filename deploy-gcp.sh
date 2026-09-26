#!/usr/bin/env bash
# ArogyaGrid - Google Cloud Deployment Script (Code for Communities 2.0)
# Deploys backend and frontend services to Google Cloud Run in region asia-south1 (Mumbai)

set -e

PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-$(gcloud config get-value project 2>/dev/null || echo "arogyagrid-national")}
REGION=${GCP_REGION:-"asia-south1"}

echo "=========================================================="
echo " ArogyaGrid National Health Logistics Cloud Deployment   "
echo " Target Project: $PROJECT_ID | Region: $REGION           "
echo "=========================================================="

# 1. Enable required Google Cloud APIs
echo "[1/4] Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  containerregistry.googleapis.com \
  bigquery.googleapis.com \
  aiplatform.googleapis.com \
  speech.googleapis.com \
  translate.googleapis.com \
  cloudbuild.googleapis.com \
  --project="$PROJECT_ID" || true

# 2. Deploy Backend to Cloud Run
echo "[2/4] Deploying Backend to Cloud Run..."
gcloud run deploy arogyagrid-backend \
  --source=./backend \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=5000 \
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$PROJECT_ID,VERTEX_AI_REGION=$REGION,BIGQUERY_DATASET=arogyagrid_analytics" \
  --project="$PROJECT_ID"

BACKEND_URL=$(gcloud run services describe arogyagrid-backend --platform=managed --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")
echo ">> Backend live at: $BACKEND_URL"

# 3. Deploy Frontend to Cloud Run
echo "[3/4] Deploying Frontend to Cloud Run..."
gcloud run deploy arogyagrid-frontend \
  --source=./frontend \
  --region="$REGION" \
  --platform=managed \
  --allow-unauthenticated \
  --port=3000 \
  --set-env-vars="VITE_API_URL=${BACKEND_URL}/api/v1" \
  --project="$PROJECT_ID"

FRONTEND_URL=$(gcloud run services describe arogyagrid-frontend --platform=managed --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")

echo "=========================================================="
echo " DEPLOYMENT COMPLETE!                                     "
echo " Frontend Web Portal: $FRONTEND_URL                       "
echo " Backend REST & WSS : $BACKEND_URL                        "
echo " Health Check       : ${BACKEND_URL}/health               "
echo " BigQuery Stream    : ${BACKEND_URL}/api/v1/cloud/status  "
echo "=========================================================="
