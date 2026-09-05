# Skill: Supply Forecasting & Stockout Early Warning

## Overview
Standard operating procedure for training, evaluating, and applying demand forecasting models for PHC medicine inventory and consumption trends.

## Inputs
- Historical 30-day daily consumption logs
- Local disease cluster footfall index (fever, respiratory, gastro)
- Seasonal / weather severity index (monsoon, heatwave)

## Execution Protocol
1. Query rolling consumption moving average {7}$ and {30}$.
2. Compute surge multiplier based on active outbreak alerts.
3. Compute Days to Stockout ($):
   DTS = \frac{\text{Current Available Stock}}{\text{Predicted Daily Demand}}
4. Classify Risk Level:
   -  < 2 \implies \text{CRITICAL}$
   -  \le DTS < 7 \implies \text{HIGH}$
   -  \le DTS \le 14 \implies \text{MODERATE}$
   -  > 14 \implies \text{LOW}$
