from pydantic import BaseModel
from typing import List, Optional

class PredictionRequest(BaseModel):
    phc_id: str
    medicine_id: str
    current_stock: int
    daily_consumption: float
    population_served: int = 10000
    weather_risk: float = 0.0
    footfall_surge_factor: float = 1.0

class PredictionResponse(BaseModel):
    phc_id: str
    medicine_id: str
    days_to_stockout: float
    risk_level: str
    confidence: float
    recommended_restock_qty: int

class BatchPredictionRequest(BaseModel):
    items: List[PredictionRequest]

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]
    critical_count: int
    high_count: int

class FederatedRoundRequest(BaseModel):
    round_id: Optional[int] = None
    participating_nodes: Optional[List[str]] = None

class FederatedRoundResponse(BaseModel):
    round_id: int
    status: str
    participating_nodes: List[str]
    global_model_version: str
    mean_loss: float
    dp_noise_applied: bool

class PHCLocation(BaseModel):
    phc_id: str
    name: str
    district_id: str
    state: str
    latitude: float
    longitude: float
    current_stock: int
    daily_consumption: float

class RedistributionRequest(BaseModel):
    target_phc: PHCLocation
    medicine_id: str
    required_quantity: int
    candidate_phcs: List[PHCLocation]
    max_radius_km: float = 60.0

class DonorCandidate(BaseModel):
    phc_id: str
    phc_name: str
    district_id: str
    state: str
    distance_km: float
    available_surplus: int
    allocated_quantity: int
    feasibility_score: float

class RedistributionResponse(BaseModel):
    target_phc_id: str
    medicine_id: str
    total_requested: int
    total_allocated: int
    fulfilled: bool
    donors: List[DonorCandidate]
