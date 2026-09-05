import numpy as np
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from app.schemas.models import PredictionRequest, PredictionResponse

class StockoutPredictor:
    def __init__(self):
        self._train_models()

    def _train_models(self):
        np.random.seed(42)
        n_samples = 600
        X = []
        y_dts = []
        y_risk = []
        
        for _ in range(n_samples):
            stock = np.random.randint(10, 800)
            consumption = np.random.uniform(5, 45)
            pop = np.random.randint(3000, 35000)
            weather = np.random.uniform(0.0, 1.0)
            surge = np.random.uniform(0.8, 2.5)
            
            eff_consumption = consumption * surge * (1.0 + 0.3 * weather)
            dts = max(0.1, stock / eff_consumption)
            
            if dts < 2.0:
                risk = 3
            elif dts < 7.0:
                risk = 2
            elif dts <= 14.0:
                risk = 1
            else:
                risk = 0
                
            X.append([stock, consumption, pop, weather, surge])
            y_dts.append(dts)
            y_risk.append(risk)
            
        X = np.array(X)
        y_dts = np.array(y_dts)
        y_risk = np.array(y_risk)
        
        self.regressor = RandomForestRegressor(n_estimators=30, random_state=42)
        self.regressor.fit(X, y_dts)
        
        self.classifier = RandomForestClassifier(n_estimators=30, random_state=42)
        self.classifier.fit(X, y_risk)
        
        self.risk_labels = {0: "LOW", 1: "MODERATE", 2: "HIGH", 3: "CRITICAL"}

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        features = np.array([[
            req.current_stock,
            req.daily_consumption,
            req.population_served,
            req.weather_risk,
            req.footfall_surge_factor
        ]])
        
        dts = float(self.regressor.predict(features)[0])
        risk_idx = int(self.classifier.predict(features)[0])
        risk_probs = self.classifier.predict_proba(features)[0]
        confidence = float(np.max(risk_probs))
        
        daily_rate = max(1.0, req.daily_consumption * req.footfall_surge_factor)
        target_stock = int(daily_rate * 30)
        restock_qty = max(0, target_stock - req.current_stock)
        
        return PredictionResponse(
            phc_id=req.phc_id,
            medicine_id=req.medicine_id,
            days_to_stockout=round(dts, 2),
            risk_level=self.risk_labels.get(risk_idx, "MODERATE"),
            confidence=round(confidence, 3),
            recommended_restock_qty=restock_qty
        )

predictor = StockoutPredictor()
