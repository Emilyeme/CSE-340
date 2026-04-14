const express = require('express')
const router = express.Router()
const invController = require('../controllers/invController.js')
const utilities = require("../utilities/")
const regValidate = require('../utilities/inventory-validation')
const { classificationRules, checkClassification } = require('../utilities/inventory-validation.js')
 
// --- PUBLIC ROUTES (No login required) ---
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))
// Add Review Route (Requires login)
router.post("/add-review", utilities.checkLogin, utilities.handleErrors(invController.addReview))

// PROTECTED: Route to build the inventory management view
router.get("/", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildManagementView))

// PROTECTED: Route to get inventory JSON for the JavaScript AJAX call
router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))

// PROTECTED: Show Add Classification form
router.get('/add-classification', utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddClassification))

// ADD THIS LINE RIGHT HERE:
router.get("/add-inventory", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildAddInventory))

// PROTECTED: Process classification form submission
router.post("/add-classification", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.addClassification))

// PROTECTED: Route to build the edit inventory view
router.get("/edit/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.editInventoryView))

// PROTECTED: Route to process the inventory update
router.post("/update/",
  utilities.checkLogin,
  utilities.checkAccountType,
  regValidate.newInventoryRules(),
  regValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
)

// PROTECTED: Route to build the delete confirmation view
router.get("/delete/:inv_id", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteConfirmView))

// PROTECTED: Route to process the deletion
router.post("/delete", utilities.checkLogin, utilities.checkAccountType, utilities.handleErrors(invController.deleteInventoryItem))

module.exports = router