import sys
import os

# Add ml_service to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas.models import PredictionRequest, RedistributionRequest, PHCLocation
from app.core.predictor import predictor
from app.core.federated import federated_coordinator
from app.core.optimizer import optimizer

def test_ml_pipeline():
    print("--- Testing ML Predictor ---")
    pred_req = PredictionRequest(
        phc_id="PHC-001",
        medicine_id="MED-001",
        current_stock=120,
        daily_consumption=35.0,
        population_served=8500,
        weather_risk=0.4,
        footfall_surge_factor=1.2
    )
    res = predictor.predict(pred_req)
    print(f"Predictor Result: DTS={res.days_to_stockout} days, Risk={res.risk_level}, Conf={res.confidence}")
    assert res.risk_level in ["LOW", "MODERATE", "HIGH", "CRITICAL"]
    assert res.days_to_stockout > 0

    print("--- Testing Federated Coordinator ---")
    fed_res = federated_coordinator.trigger_round(["Bihar", "Jharkhand", "Odisha"])
    print(f"FedAvg Round: {fed_res.round_id}, Version: {fed_res.global_model_version}, Nodes: {fed_res.participating_nodes}")
    assert fed_res.status == "COMPLETED"

    print("--- Testing Logistics Optimizer ---")
    target = PHCLocation(
        phc_id="PHC-RANCHI-01",
        name="Ranchi Central PHC",
        district_id="DIST-01",
        state="Jharkhand",
        latitude=23.3441,
        longitude=85.3096,
        current_stock=40,
        daily_consumption=30.0
    )
    donor1 = PHCLocation(
        phc_id="PHC-RANCHI-02",
        name="Kanke Rural PHC",
        district_id="DIST-01",
        state="Jharkhand",
        latitude=23.4350,
        longitude=85.3200,
        current_stock=600,
        daily_consumption=20.0
    )
    redis_req = RedistributionRequest(
        target_phc=target,
        medicine_id="MED-001",
        required_quantity=200,
        candidate_phcs=[target, donor1],
        max_radius_km=50.0
    )
    opt_res = optimizer.optimize(redis_req)
    print(f"Optimization Result: Requested={opt_res.total_requested}, Allocated={opt_res.total_allocated}, Fulfilled={opt_res.fulfilled}")
    assert len(opt_res.donors) > 0

    print("ALL ML SERVICE UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_ml_pipeline()
