const abdmService = require('../services/abdmService');

exports.getFhirBundle = async (req, res) => {
  try {
    const { districtId } = req.params;
    const bundle = abdmService.exportFhirR4Bundle(districtId);
    res.json(bundle);
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'FHIR_EXPORT_FAILED' });
  }
};

exports.getHfrRegistry = async (req, res) => {
  try {
    const { districtId } = req.params;
    const facilities = abdmService.getHfrRegistry(districtId);
    res.json({ success: true, count: facilities.length, facilities });
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'HFR_REGISTRY_FAILED' });
  }
};

exports.syncEAushadhi = async (req, res) => {
  try {
    const { district_id, state_warehouse_code } = req.body;
    const result = await abdmService.syncWithEAushadhi({
      districtId: district_id,
      stateWarehouseCode: state_warehouse_code
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'EAUSHADHI_SYNC_FAILED' });
  }
};

exports.verifyAbha = async (req, res) => {
  try {
    const { abha_number, patient_name, consent_purpose } = req.body;
    const result = await abdmService.verifyAbhaId({
      abhaNumber: abha_number,
      patientName: patient_name,
      consentPurpose: consent_purpose
    });
    if (!result.valid) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message, code: 'ABHA_VERIFICATION_FAILED' });
  }
};
