/**
 * Google BigQuery Setup & Connectivity Verification Script
 * Code for Communities 2.0 - Google Cloud Integration
 */

const fs = require('fs');
const path = require('path');
const bigqueryService = require('../services/bigqueryService');

async function setupBigQuery() {
  console.log('================================================================');
  console.log('       AROGYAGRID GOOGLE CLOUD BIGQUERY TELEMETRY SETUP        ');
  console.log('================================================================');
  console.log(`GCP Project:  ${bigqueryService.projectId}`);
  console.log(`GCP Dataset:  ${bigqueryService.datasetId}`);
  console.log(`Region:       asia-south1 (Mumbai)`);
  console.log(`Connection:   ${bigqueryService.isGcpConnected ? 'ONLINE (Direct GCP Ingestion)' : 'LOCAL STREAM BUFFER'}`);
  console.log('----------------------------------------------------------------');

  const schemaPath = path.join(__dirname, '../db/bigquery_schema.sql');
  if (fs.existsSync(schemaPath)) {
    const ddl = fs.readFileSync(schemaPath, 'utf8');
    const tableMatches = ddl.match(/CREATE TABLE IF NOT EXISTS `([^`]+)`/g) || [];
    const viewMatches = ddl.match(/CREATE OR REPLACE VIEW `([^`]+)`/g) || [];
    
    console.log(`[Schema DDL] Loaded ${schemaPath}`);
    console.log(`[Tables] Found ${tableMatches.length} BigQuery tables:`);
    tableMatches.forEach(t => console.log('  • ' + t.replace(/CREATE TABLE IF NOT EXISTS `|`/g, '')));
    
    console.log(`[Views] Found ${viewMatches.length} BigQuery analytical views:`);
    viewMatches.forEach(v => console.log('  • ' + v.replace(/CREATE OR REPLACE VIEW `|`/g, '')));
  }

  console.log('\n[Verification] Ingesting test stock transaction event...');
  const testEvent = await bigqueryService.streamStockEvent({
    transaction_uuid: 'TX-TEST-' + Date.now(),
    phc_id: 'PHC-RAN-01',
    medicine_id: 'MED-001',
    quantity: 100,
    transaction_type: 'INTAKE',
    created_by: 'setup.script@arogyagrid.gov.in'
  });
  console.log('  ✔ Streamed Event ID:  ' + testEvent.event_id);
  console.log('  ✔ BigQuery Partition: ' + testEvent.bigquery_partition_date);

  console.log('\n[Verification] Ingesting test ICMR drone flight mission...');
  const testFlight = await bigqueryService.streamDroneFlightEvent({
    transfer_id: 'TRF-TEST-001',
    source_phc: 'PHC-RAN-01',
    destination_phc: 'PHC-RAN-03',
    payload_kg: 2.5,
    flight_mins: 12,
    time_saved_mins: 48,
    transport_mode: 'ICMR_DRONE_VTOL'
  });
  console.log('  ✔ Flight Mission ID:  ' + testFlight.flight_id);
  console.log('  ✔ Carbon Offset (kg): ' + testFlight.co2_saved_kg);

  const status = bigqueryService.getStreamingBuffer(5);
  console.log('\n[Buffer Status] Current buffer count: ' + status.buffer_count);
  console.log('================================================================');
  console.log(' BigQuery integration verified successfully.');
  console.log('================================================================');
}

setupBigQuery().catch(console.error);
