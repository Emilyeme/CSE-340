// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")
const invController = require("../controllers/invController")

// Route to build login view
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/",
  utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement)
)

// 1. The Management View Route (ADD THIS IF MISSING)
router.get("/", utilities.handleErrors(invController.buildManagementView))


router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build registration view
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Add these below your existing routes
router.get("/logout", accountController.accountLogout) // Task 6

router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate)) // Task 5
router.post("/update", utilities.checkLogin, accountController.updateAccount) // Task 5
router.post("/update-password", utilities.checkLogin, accountController.updatePassword) // Task 

module.exports = router
