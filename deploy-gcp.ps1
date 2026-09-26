# ArogyaGrid - Google Cloud Deployment Script (Windows PowerShell)
# Deploys backend and frontend to Google Cloud Run in region asia-south1 (Mumbai)

$ErrorActionPreference = "Stop"

$ProjectId = $env:GOOGLE_CLOUD_PROJECT
if (-not $ProjectId) {
    try {
        $ProjectId = (gcloud config get-value project 2>$null).Trim()
    } catch {
        $ProjectId = "arogyagrid-national"
    }
}
if (-not $ProjectId) { $ProjectId = "arogyagrid-national" }

$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " ArogyaGrid National Health Logistics Cloud Deployment   " -ForegroundColor Cyan
Write-Host " Target Project: $ProjectId | Region: $Region           " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Enable Required GCP APIs
Write-Host "[1/4] Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable `
  run.googleapis.com `
  containerregistry.googleapis.com `
  bigquery.googleapis.com `
  aiplatform.googleapis.com `
  speech.googleapis.com `
  translate.googleapis.com `
  cloudbuild.googleapis.com `
  --project="$ProjectId"

# 2. Deploy Backend to Cloud Run
Write-Host "[2/4] Deploying Backend to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy arogyagrid-backend `
  --source=./backend `
  --region="$Region" `
  --platform=managed `
  --allow-unauthenticated `
  --port=5000 `
  --set-env-vars="NODE_ENV=production,GOOGLE_CLOUD_PROJECT=$ProjectId,VERTEX_AI_REGION=$Region,BIGQUERY_DATASET=arogyagrid_analytics" `
  --project="$ProjectId"

$BackendUrl = (gcloud run services describe arogyagrid-backend --platform=managed --region="$Region" --project="$ProjectId" --format="value(status.url)").Trim()
Write-Host ">> Backend live at: $BackendUrl" -ForegroundColor Green

# 3. Deploy Frontend to Cloud Run
Write-Host "[3/4] Deploying Frontend to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy arogyagrid-frontend `
  --source=./frontend `
  --region="$Region" `
  --platform=managed `
  --allow-unauthenticated `
  --port=3000 `
  --set-env-vars="VITE_API_URL=$BackendUrl/api/v1" `
  --project="$ProjectId"

$FrontendUrl = (gcloud run services describe arogyagrid-frontend --platform=managed --region="$Region" --project="$ProjectId" --format="value(status.url)").Trim()

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " DEPLOYMENT COMPLETE!                                     " -ForegroundColor Green
Write-Host " Frontend Web Portal: $FrontendUrl                        " -ForegroundColor White
Write-Host " Backend REST & WSS : $BackendUrl                         " -ForegroundColor White
Write-Host " Health Check       : $BackendUrl/health                  " -ForegroundColor White
Write-Host " BigQuery Stream    : $BackendUrl/api/v1/cloud/status     " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
