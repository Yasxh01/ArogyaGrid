from fastapi import APIRouter
from app.schemas.models import (
    PredictionRequest, PredictionResponse,
    BatchPredictionRequest, BatchPredictionResponse
)
from app.core.predictor import predictor

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictionResponse)
def predict_stockout(req: PredictionRequest):
    return predictor.predict(req)

@router.post("/batch", response_model=BatchPredictionResponse)
def predict_batch(req: BatchPredictionRequest):
    preds = [predictor.predict(item) for item in req.items]
    critical_cnt = sum(1 for p in preds if p.risk_level == "CRITICAL")
    high_cnt = sum(1 for p in preds if p.risk_level == "HIGH")
    return BatchPredictionResponse(
        predictions=preds,
        critical_count=critical_cnt,
        high_count=high_cnt
    )
