import os
import sys

# Ensure ml_service directory is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
for p in [current_dir, parent_dir]:
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.routers import predict, federated, redistribution
    from app.config import settings
except ImportError:
    from ml_service.app.routers import predict, federated, redistribution
    from ml_service.app.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    description="ArogyaGrid ML Microservice providing stockout forecasting, federated aggregation, and logistics balancing."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
app.include_router(federated.router)
app.include_router(redistribution.router)

@app.get("/")
def root():
    return {
        "service": settings.app_name,
        "version": settings.version,
        "status": "healthy"
    }
