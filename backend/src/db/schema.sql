-- ArogyaGrid Database Schema (PostgreSQL 16)
-- Enterprise Multi-Tier Healthcare Supply Chain & Hospital Resource Grid

CREATE TABLE IF NOT EXISTS districts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    state VARCHAR(64) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phcs (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    facility_type VARCHAR(32) DEFAULT 'PHC', -- 'DISTRICT_HOSPITAL', 'CHC', 'PHC', 'SUB_CENTRE_HWC'
    district_id VARCHAR(64) REFERENCES districts(id),
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    capacity INT DEFAULT 50,
    status VARCHAR(32) DEFAULT 'HEALTHY', -- 'HEALTHY', 'WARNING', 'CRITICAL'
    population_served INT DEFAULT 12000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    role VARCHAR(32) NOT NULL, -- 'ADMIN', 'DISTRICT_OFFICER', 'DOCTOR', 'PHC_STAFF'
    district_id VARCHAR(64) REFERENCES districts(id),
    phc_id VARCHAR(64) REFERENCES phcs(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
    id VARCHAR(64) PRIMARY KEY,
    nlem_code VARCHAR(32), -- National List of Essential Medicines (NLEM-2022) / WHO ATC
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    unit VARCHAR(32) NOT NULL,
    storage_type VARCHAR(32) DEFAULT 'AMBIENT', -- 'COLD_CHAIN_2_8C', 'AMBIENT'
    minimum_stock INT NOT NULL DEFAULT 50,
    daily_base_consumption DOUBLE PRECISION DEFAULT 10.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock (
    id VARCHAR(64) PRIMARY KEY,
    phc_id VARCHAR(64) REFERENCES phcs(id),
    medicine_id VARCHAR(64) REFERENCES medicines(id),
    quantity INT NOT NULL DEFAULT 0,
    daily_consumption DOUBLE PRECISION DEFAULT 10.0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_positive_stock CHECK (quantity >= 0),
    CONSTRAINT unique_phc_medicine UNIQUE (phc_id, medicine_id)
);

CREATE TABLE IF NOT EXISTS batches (
    id VARCHAR(64) PRIMARY KEY,
    phc_id VARCHAR(64) REFERENCES phcs(id),
    medicine_id VARCHAR(64) REFERENCES medicines(id),
    batch_number VARCHAR(64) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    mfg_date DATE,
    expiry_date DATE NOT NULL,
    challan_ref VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cold_chain_units (
    id VARCHAR(64) PRIMARY KEY,
    phc_id VARCHAR(64) REFERENCES phcs(id),
    model_name VARCHAR(128) NOT NULL,
    min_temp_celsius DOUBLE PRECISION DEFAULT 2.0,
    max_temp_celsius DOUBLE PRECISION DEFAULT 8.0,
    current_temp_celsius DOUBLE PRECISION DEFAULT 4.5,
    ambient_temp_celsius DOUBLE PRECISION DEFAULT 28.0,
    power_status VARCHAR(32) DEFAULT 'MAINS_ACTIVE', -- 'MAINS_ACTIVE', 'BATTERY_BACKUP', 'GENERATOR', 'POWER_FAIL'
    battery_runtime_mins INT DEFAULT 360,
    status VARCHAR(32) DEFAULT 'NORMAL', -- 'NORMAL', 'WARNING', 'BREACH'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cold_chain_telemetry_logs (
    id VARCHAR(64) PRIMARY KEY,
    unit_id VARCHAR(64) REFERENCES cold_chain_units(id),
    temperature_celsius DOUBLE PRECISION NOT NULL,
    ambient_temp_celsius DOUBLE PRECISION NOT NULL,
    power_status VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_transactions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_uuid VARCHAR(64) UNIQUE NOT NULL,
    phc_id VARCHAR(64) REFERENCES phcs(id),
    medicine_id VARCHAR(64) REFERENCES medicines(id),
    quantity INT NOT NULL,
    transaction_type VARCHAR(32) NOT NULL,
    batch_number VARCHAR(64),
    challan_ref VARCHAR(64),
    created_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS beds (
    id VARCHAR(64) PRIMARY KEY,
    phc_id VARCHAR(64) REFERENCES phcs(id),
    bed_type VARCHAR(32) NOT NULL, -- 'GENERAL', 'OXYGEN', 'ICU', 'PEDIATRIC'
    total_beds INT NOT NULL DEFAULT 10,
    occupied_beds INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_attendance (
    id VARCHAR(64) PRIMARY KEY,
    phc_id VARCHAR(64) REFERENCES phcs(id),
    staff_name VARCHAR(128) NOT NULL,
    role VARCHAR(64) NOT NULL,
    shift VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ON_DUTY',
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(64) PRIMARY KEY,
    phc_id VARCHAR(64) REFERENCES phcs(id),
    medicine_id VARCHAR(64) REFERENCES medicines(id),
    days_to_stockout DOUBLE PRECISION NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    recommended_restock_qty INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfers (
    id VARCHAR(64) PRIMARY KEY,
    source_phc_id VARCHAR(64) REFERENCES phcs(id),
    destination_phc_id VARCHAR(64) REFERENCES phcs(id),
    medicine_id VARCHAR(64) REFERENCES medicines(id),
    quantity INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    route_distance_km DOUBLE PRECISION,
    requested_by VARCHAR(64),
    approved_by VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
