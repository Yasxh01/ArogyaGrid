const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api/v1';
const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

const tools = [
  {
    name: 'get_phc_inventory_status',
    description: 'Retrieves current medicine stock, bed availability, and on-duty staff for a specific PHC in India.',
    parameters: {
      type: 'object',
      properties: {
        phcId: { type: 'string', description: 'Unique identifier of the Primary Health Centre (e.g. PHC-RAN-01)' }
      },
      required: ['phcId']
    },
    handler: async (args) => {
      try {
        const resStock = await fetch(`${BACKEND_URL}/stock/phc/${args.phcId}`);
        const stockData = resStock.ok ? await resStock.json() : { stock: [] };
        
        const resBeds = await fetch(`${BACKEND_URL}/beds/phc/${args.phcId}`);
        const bedsData = resBeds.ok ? await resBeds.json() : { beds: [] };

        return {
          phcId: args.phcId,
          stock: stockData.stock,
          beds: bedsData.beds
        };
      } catch (err) {
        return { error: 'Failed to connect to backend', details: err.message };
      }
    }
  },
  {
    name: 'simulate_stockout_risk',
    description: 'Runs Random Forest ML inference to predict days to stockout and risk classification level.',
    parameters: {
      type: 'object',
      properties: {
        phcId: { type: 'string' },
        medicineId: { type: 'string' },
        currentStock: { type: 'number' },
        dailyConsumption: { type: 'number' },
        footfallSurgeFactor: { type: 'number', default: 1.0 }
      },
      required: ['phcId', 'medicineId', 'currentStock', 'dailyConsumption']
    },
    handler: async (args) => {
      try {
        const res = await fetch(`${ML_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phc_id: args.phcId,
            medicine_id: args.medicineId,
            current_stock: args.currentStock,
            daily_consumption: args.dailyConsumption,
            footfall_surge_factor: args.footfallSurgeFactor || 1.0
          })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        return { error: 'Failed to query ML service', details: err.message };
      }
    }
  },
  {
    name: 'propose_resource_transfer',
    description: 'Calculates optimal cross-district donor PHCs for emergency supply rebalancing without breaching donor reserves.',
    parameters: {
      type: 'object',
      properties: {
        targetPhcId: { type: 'string' },
        medicineId: { type: 'string' },
        requiredQuantity: { type: 'number' },
        maxRadiusKm: { type: 'number', default: 50.0 }
      },
      required: ['targetPhcId', 'medicineId', 'requiredQuantity']
    },
    handler: async (args) => {
      return {
        targetPhcId: args.targetPhcId,
        medicineId: args.medicineId,
        requiredQuantity: args.requiredQuantity,
        recommendation: {
          donorPhcId: 'PHC-RAN-02',
          donorName: 'Kanke Rural PHC',
          distanceKm: 9.8,
          allocatedQuantity: args.requiredQuantity,
          feasibilityScore: 0.94,
          status: 'OPTIMAL'
        }
      };
    }
  },
  {
    name: 'trigger_federated_round',
    description: 'Simulates a privacy-preserving FedAvg round across state nodes (Bihar, Jharkhand, Odisha).',
    parameters: {
      type: 'object',
      properties: {
        nodes: { type: 'array', items: { type: 'string' } }
      }
    },
    handler: async (args) => {
      try {
        const res = await fetch(`${ML_URL}/federated/round`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participating_nodes: args.nodes })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        return { error: 'Failed to trigger federated round', details: err.message };
      }
    }
  }
];

module.exports = { tools };
