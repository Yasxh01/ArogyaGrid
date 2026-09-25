-- ======================================================================================
-- AROGYAGRID NATIONAL HEALTHCARE INFRASTRUCTURE
-- Google Cloud BigQuery Analytics & Telemetry Schema DDL
-- Track: Code for Communities 2.0 (Google Cloud & Open Data)
-- Target Dataset: `arogyagrid_analytics` (Region: asia-south1)
-- ======================================================================================

-- 1. Create Analytics Dataset
CREATE SCHEMA IF NOT EXISTS `arogyagrid_analytics`
OPTIONS(
  location = 'asia-south1',
  description = 'ArogyaGrid national public healthcare supply chain and telemetry analytics dataset'
);

-- 2. High-Velocity Stock Transactions Table
-- Partitioned by ingestion date and clustered by facility and medicine for low-cost high-speed queries
CREATE TABLE IF NOT EXISTS `arogyagrid_analytics.stock_transactions` (
  event_id STRING NOT NULL OPTIONS(description="Unique BigQuery UUID for the ingestion event"),
  transaction_uuid STRING NOT NULL OPTIONS(description="Idempotent transaction UUID from grassroots client"),
  phc_id STRING NOT NULL OPTIONS(description="Primary Health Centre identifier"),
  medicine_id STRING NOT NULL OPTIONS(description="National List of Essential Medicines (NLEM) identifier"),
  quantity INT64 NOT NULL OPTIONS(description="Units dispensed or replenished"),
  transaction_type STRING NOT NULL OPTIONS(description="INTAKE, DISPENSE, or REBALANCE_TRANSFER"),
  created_by STRING OPTIONS(description="Email or staff identifier who initiated the transaction"),
  ingested_at TIMESTAMP NOT NULL OPTIONS(description="Timestamp when received by ArogyaGrid gateway"),
  bigquery_partition_date DATE NOT NULL OPTIONS(description="Partition date for BigQuery billing optimization")
)
PARTITION BY bigquery_partition_date
CLUSTER BY phc_id, medicine_id;

-- 3. ICMR Drone & Road Multi-Modal Flight Missions Telemetry
CREATE TABLE IF NOT EXISTS `arogyagrid_analytics.drone_flight_telemetry` (
  flight_id STRING NOT NULL,
  transfer_id STRING NOT NULL,
  source_phc STRING NOT NULL,
  destination_phc STRING NOT NULL,
  payload_kg FLOAT64 NOT NULL,
  flight_mins INT64 NOT NULL,
  time_saved_mins INT64 NOT NULL,
  transport_mode STRING NOT NULL,
  co2_saved_kg FLOAT64 NOT NULL,
  ingested_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(ingested_at)
CLUSTER BY source_phc, destination_phc;

-- 4. Vaccine Cold-Chain IoT Sensor Excursion Logs
CREATE TABLE IF NOT EXISTS `arogyagrid_analytics.cold_chain_telemetry` (
  telemetry_id STRING NOT NULL,
  unit_id STRING NOT NULL,
  phc_id STRING NOT NULL,
  temperature_celsius FLOAT64 NOT NULL,
  target_min_celsius FLOAT64 DEFAULT 2.0,
  target_max_celsius FLOAT64 DEFAULT 8.0,
  power_status STRING NOT NULL,
  battery_pct INT64 NOT NULL,
  excursion_alert BOOL NOT NULL,
  logged_at TIMESTAMP NOT NULL
)
PARTITION BY DATE(logged_at)
CLUSTER BY phc_id, unit_id;

-- 5. Disease Surveillance & Epidemic Outbreak Reports (IDSP Aligned)
CREATE TABLE IF NOT EXISTS `arogyagrid_analytics.epidemic_outbreaks` (
  outbreak_id STRING NOT NULL,
  district_id STRING NOT NULL,
  phc_id STRING NOT NULL,
  outbreak_type STRING NOT NULL,
  severity_level STRING NOT NULL,
  affected_population_estimate INT64 NOT NULL,
  status STRING NOT NULL,
  detected_at TIMESTAMP NOT NULL,
  mitigated_at TIMESTAMP
)
CLUSTER BY district_id, outbreak_type;

-- ======================================================================================
-- ANALYTICAL VIEWS FOR EPIDEMIC PREDICTION & SUPPLY CHAIN OPTIMIZATION
-- ======================================================================================

-- View A: 7-Day Rolling Daily Consumption Burn Rate per Medicine & Facility
CREATE OR REPLACE VIEW `arogyagrid_analytics.vw_daily_consumption_burn` AS
SELECT 
  phc_id,
  medicine_id,
  ROUND(SUM(CASE WHEN transaction_type = 'DISPENSE' THEN quantity ELSE 0 END) / 7.0, 2) AS avg_daily_burn_7d,
  SUM(CASE WHEN transaction_type = 'INTAKE' THEN quantity ELSE 0 END) AS total_replenished_7d,
  COUNT(DISTINCT transaction_uuid) AS dispense_frequency_7d
FROM `arogyagrid_analytics.stock_transactions`
WHERE bigquery_partition_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY phc_id, medicine_id;

-- View B: Environmental Carbon & Transit Savings via ICMR Drone Airway
CREATE OR REPLACE VIEW `arogyagrid_analytics.vw_drone_logistics_impact` AS
SELECT 
  DATE(ingested_at) AS flight_date,
  COUNT(flight_id) AS total_drone_sorties,
  SUM(payload_kg) AS total_lifesaving_cargo_kg,
  SUM(time_saved_mins) AS total_minutes_saved_vs_road,
  ROUND(SUM(co2_saved_kg), 2) AS total_carbon_emissions_avoided_kg
FROM `arogyagrid_analytics.drone_flight_telemetry`
GROUP BY flight_date
ORDER BY flight_date DESC;

-- View C: Cold-Chain Thermal Excursion Risk Summary
CREATE OR REPLACE VIEW `arogyagrid_analytics.vw_cold_chain_health` AS
SELECT 
  phc_id,
  unit_id,
  AVG(temperature_celsius) AS avg_recorded_temp,
  MIN(temperature_celsius) AS min_recorded_temp,
  MAX(temperature_celsius) AS max_recorded_temp,
  COUNTIF(excursion_alert = TRUE) AS total_breach_events,
  MAX(logged_at) AS last_telemetry_ping
FROM `arogyagrid_analytics.cold_chain_telemetry`
WHERE DATE(logged_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)
GROUP BY phc_id, unit_id;
