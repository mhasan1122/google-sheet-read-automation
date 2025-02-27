const express = require('express');
const router = express.Router();
const { getSheetData } = require('../controllers/sheetController'); // Import the controller

// Define the route for fetching sheet data
router.get('/sheet-data', getSheetData);

module.exports = router;
