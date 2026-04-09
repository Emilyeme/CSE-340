const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController.js')
const { classificationRules, checkClassification } = require('../utilities/inventory-validation.js')

// Show Add Classification form
router.get('/add-classification', invController.buildAddClassification)

// Process form submission
router.post("/add-classification", invController.addClassification);

module.exports = router