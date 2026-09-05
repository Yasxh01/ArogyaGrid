from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "ArogyaGrid Federated ML Engine"
    version: str = "1.0.0"
    default_state_nodes: list[str] = ["Bihar", "Jharkhand", "Odisha", "West Bengal", "Assam"]
    dp_epsilon: float = 1.0
    dp_clip_norm: float = 5.0

settings = Settings()
