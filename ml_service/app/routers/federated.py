from fastapi import APIRouter
from app.schemas.models import FederatedRoundRequest, FederatedRoundResponse
from app.core.federated import federated_coordinator

router = APIRouter(prefix="/federated", tags=["Federated Learning"])

@router.get("/status")
def get_federated_status():
    return federated_coordinator.get_status()

@router.post("/round", response_model=FederatedRoundResponse)
def trigger_federated_round(req: FederatedRoundRequest):
    return federated_coordinator.trigger_round(req.participating_nodes)
