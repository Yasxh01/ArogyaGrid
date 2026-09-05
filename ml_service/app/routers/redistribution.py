from fastapi import APIRouter
from app.schemas.models import RedistributionRequest, RedistributionResponse
from app.core.optimizer import optimizer

router = APIRouter(prefix="/redistribute", tags=["Redistribution Optimization"])

@router.post("/recommend", response_model=RedistributionResponse)
def recommend_redistribution(req: RedistributionRequest):
    return optimizer.optimize(req)
