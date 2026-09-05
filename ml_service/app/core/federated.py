import numpy as np
from app.config import settings
from app.schemas.models import FederatedRoundResponse

class FederatedCoordinator:
    def __init__(self):
        self.current_round = 4
        self.global_weights = np.array([0.45, -0.12, 0.88, 0.34, 0.72, -0.05])
        self.history = []

    def trigger_round(self, participating_nodes: list[str] = None) -> FederatedRoundResponse:
        self.current_round += 1
        nodes = participating_nodes or settings.default_state_nodes
        
        client_updates = []
        losses = []
        for node in nodes:
            noise = np.random.normal(0, 0.05, size=self.global_weights.shape)
            node_weights = self.global_weights + noise
            norm = np.linalg.norm(node_weights)
            if norm > settings.dp_clip_norm:
                node_weights = node_weights * (settings.dp_clip_norm / norm)
            client_updates.append(node_weights)
            losses.append(float(np.random.uniform(0.08, 0.18)))
            
        avg_weights = np.mean(client_updates, axis=0)
        dp_noise = np.random.laplace(0, 1.0 / settings.dp_epsilon, size=avg_weights.shape) * 0.01
        self.global_weights = avg_weights + dp_noise
        
        mean_loss = float(np.mean(losses))
        version_str = f"v2.{self.current_round}.0"
        response = FederatedRoundResponse(
            round_id=self.current_round,
            status="COMPLETED",
            participating_nodes=nodes,
            global_model_version=version_str,
            mean_loss=round(mean_loss, 4),
            dp_noise_applied=True
        )
        self.history.append(response.model_dump())
        return response

    def get_status(self):
        version_str = f"v2.{self.current_round}.0"
        return {
            "current_round": self.current_round,
            "global_model_version": version_str,
            "active_nodes": settings.default_state_nodes,
            "dp_epsilon": settings.dp_epsilon,
            "history_count": len(self.history)
        }

federated_coordinator = FederatedCoordinator()
