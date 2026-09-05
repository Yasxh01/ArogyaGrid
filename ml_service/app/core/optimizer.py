import math
from app.schemas.models import RedistributionRequest, RedistributionResponse, DonorCandidate

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class CrossDistrictOptimizer:
    def optimize(self, req: RedistributionRequest) -> RedistributionResponse:
        target = req.target_phc
        needed = req.required_quantity
        candidates = []
        
        for cand in req.candidate_phcs:
            if cand.phc_id == target.phc_id:
                continue
                
            dist = haversine_distance(target.latitude, target.longitude, cand.latitude, cand.longitude)
            if dist > req.max_radius_km:
                continue
                
            min_reserve = int(cand.daily_consumption * 14)
            surplus = max(0, cand.current_stock - min_reserve)
            
            if surplus <= 0:
                continue
                
            distance_score = max(0.1, 1.0 - (dist / req.max_radius_km))
            surplus_score = min(1.0, surplus / max(1, needed))
            feasibility = round((distance_score * 0.6) + (surplus_score * 0.4), 3)
            
            candidates.append(DonorCandidate(
                phc_id=cand.phc_id,
                phc_name=cand.name,
                district_id=cand.district_id,
                state=cand.state,
                distance_km=round(dist, 1),
                available_surplus=surplus,
                allocated_quantity=0,
                feasibility_score=feasibility
            ))
            
        candidates.sort(key=lambda x: x.feasibility_score, reverse=True)
        
        allocated_total = 0
        remaining = needed
        
        for donor in candidates:
            if remaining <= 0:
                break
            alloc = min(remaining, donor.available_surplus)
            donor.allocated_quantity = alloc
            allocated_total += alloc
            remaining -= alloc
            
        active_donors = [d for d in candidates if d.allocated_quantity > 0]
        
        return RedistributionResponse(
            target_phc_id=target.phc_id,
            medicine_id=req.medicine_id,
            total_requested=needed,
            total_allocated=allocated_total,
            fulfilled=(allocated_total >= needed),
            donors=active_donors
        )

optimizer = CrossDistrictOptimizer()
