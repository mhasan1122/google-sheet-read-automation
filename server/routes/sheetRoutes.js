const express = require('express');
const { getSheetData } = require('../controllers/sheetController.js');

const router = express.Router();

router.get('/sheet-data', getSheetData);

module.exports = router;