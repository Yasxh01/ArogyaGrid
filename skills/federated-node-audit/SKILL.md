# Skill: Federated Node Auditing & Differential Privacy

## Overview
Protocol for validating weight updates submitted by regional state nodes (Bihar, Jharkhand, Odisha) before applying FedAvg aggregation to the global model.

## Validation Steps
1. Verify client weight norms fall within bounded threshold  \le C$.
2. Inject Laplace / Gaussian Differential Privacy noise ($\epsilon = 1.0, \delta = 10^{-5}$).
3. Perform coordinate-wise trimmed mean aggregation to resist model poisoning attacks.
