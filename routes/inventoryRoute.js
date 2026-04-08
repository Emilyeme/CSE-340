// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const validation = require("../utilities/inventory-validation")

router.get("/type/:classificationId", invController.buildByClassificationId);


/* ****************************************
 * Route to build vehicle detail view
 **************************************** */
router.get("/detail/:id", 
utilities.handleErrors(invController.buildDetail))

/* ****************************************
 * Error Route
 * Assignment 3, Task 3
 **************************************** */
router.get(
  "/broken",
  utilities.handleErrors(invController.throwError)
)

router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification))

router.post(
  "/add-classification",
  validation.classificationRules(),
  validation.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)


module.exports = router;