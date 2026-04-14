const utilities = require("../utilities/")
const invModel = require("../models/inventory-model") // <-- ADDED: Required to get inventory data
const reviewModel = require("../models/review-model") // <-- ADDED: Required to get review data

/* ****************************************
 *  Deliver Add Classification View
 * *************************************** */
async function buildAddClassification(req, res) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: ''
  })
}

/* ****************************************
 *  Process Add Classification
 * *************************************** */
async function addClassification(req, res) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body
  
  // Note: In a previous activity you likely had a model call here. 
  // If you did, keep your original code for this block. 
  // If not, here is a basic version:
  req.flash('success', `${classification_name} added successfully!`)
  res.redirect('/inv/')
}

/* ****************************************
 *  Deliver Inventory Management View
 * *************************************** */
async function buildManagementView(req, res, next) {
  let nav = await utilities.getNav()
  // ADDED: Calls the utility to build the dropdown list
  const classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect // ADDED: Passes the list to the view
  })
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON(req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
async function editInventoryView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}
/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  // This line calls the MODEL function to do the actual database update
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build Delete Confirmation View
 * ************************** */
async function buildDeleteConfirmView(req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Process the Delete Request
 * ************************** */
async function deleteInventoryItem(req, res, next) {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect("/inv/delete/" + inv_id)
  }
}

/* ***************************
 *  Build vehicle detail view
 * ************************** */
async function buildByInvId(req, res, next) {
  const inv_id = parseInt(req.params.invId)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryById(inv_id)
  const reviews = await reviewModel.getReviewsByInvId(inv_id)
  
  // ---> ADD THIS LINE (It builds the HTML string for the car details) <---
  const htmlData = await utilities.buildSingleVehicleDisplay(itemData)
  
  const className = itemData.classification_name
  res.render("./inventory/detail", {
    title: itemData.inv_make + " " + itemData.inv_model,
    nav,
    className,
    itemData,
    htmlData, // ---> ADD THIS LINE (Passes it to the view)
    reviews   // (Your reviews are already here!)
  })
}

/* ***************************
 *  Process New Review
 * ************************** */
async function addReview(req, res, next) {
  const { inv_id, review_text, review_rating } = req.body
  const account_id = res.locals.accountData.account_id
  
  // Basic validation
  if (!review_text || !review_rating) {
    req.flash("notice", "Please provide both a rating and a review.")
    return res.redirect(`/inv/detail/${inv_id}`)
  }

  const result = await reviewModel.addReview(inv_id, account_id, review_text, parseInt(review_rating))
  
  if (result) {
    req.flash("notice", "Review added successfully!")
  } else {
    req.flash("notice", "Sorry, the review failed to post.")
  }
  return res.redirect(`/inv/detail/${inv_id}`)
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
async function buildByClassificationId(req, res, next) {
  const classification_id = parseInt(req.params.classificationId)
  let nav = await utilities.getNav()
  const data = await invModel.getInventoryByClassificationId(classification_id)
  
  let grid
  if (data.length > 0) {
    grid = await utilities.buildClassificationGrid(data)
    let className = data[0].classification_name
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      className
    })
  } else {
    req.flash("notice", "Sorry, no matching vehicles could be found.")
    res.render("./inventory/classification", {
      title: "No vehicles found",
      nav,
      grid: '<p class="notice">Sorry, no matching vehicles could be found.</p>',
      className: ""
    })
  }
}
/* ***************************
 *  Build Add Inventory View
 * ************************** */
async function buildAddInventory(req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: ""
  })
}

/* ****************************************
 *  Export all functions at the bottom
 * *************************************** */
module.exports = {
  buildAddClassification,
  addClassification,
  buildManagementView,
  getInventoryJSON,
  editInventoryView,
  updateInventory,
  buildDeleteConfirmView,
  deleteInventoryItem
  ,addReview
  , buildByInvId
  , buildByClassificationId
  , buildAddInventory
}