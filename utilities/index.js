const jwt = require("jsonwebtoken")
require("dotenv").config()

const invModel = require("../models/inventory-model")


const Util = {}





/* ************************


 * Constructs the nav HTML unordered list


 ************************** */


Util.getNav = async function (req, res, next) {


  let data = await invModel.getClassifications()


  let list = "<ul>"


  list += '<li><a href="/" title="Home page">Home</a></li>'


  data.rows.forEach((row) => {


    list += "<li>"


    list +=


      '<a href="/inv/type/' +


      row.classification_id +


      '" title="See our inventory of ' +


      row.classification_name +


      ' vehicles">' +


      row.classification_name +


      "</a>"


    list += "</li>"


  })


  list += "</ul>"


  return list


}








/* **************************************


* Build the classification view HTML


* ************************************ */


Util.buildClassificationGrid = async function(data){


    let grid


    if(data.length > 0){


      grid = '<ul id="inv-display">'


      data.forEach(vehicle => { 


        grid += '<li>'


        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 


        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 


        + 'details"><img src="' + vehicle.inv_thumbnail 


        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 


        +' on CSE Motors" /></a>'


        grid += '<div class="namePrice">'


        grid += '<hr />'


        grid += '<h2>'


        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 


        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 


        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'


        grid += '</h2>'


        grid += '<span>$' 


        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'


        grid += '</div>'


        grid += '</li>'


      })


      grid += '</ul>'


    } else { 


      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'


    }


    return grid


  }


/* ****************************************
 * Build the vehicle detail HTML
 * Assignment 3, Task 1
 **************************************** */
Util.buildSingleVehicleDisplay = async (vehicle) => {
  let svd = '<section id="vehicle-display">'
  svd += "<div>"
  svd += '<section class="imagePrice">'
  svd +=
    "<img src='" +
    vehicle.inv_image +
    "' alt='Image of " +
    vehicle.inv_make +
    " " +
    vehicle.inv_model +
    " on cse motors' id='mainImage'>"
  svd += "</section>"
  svd += '<section class="vehicleDetail">'
  svd += "<h3> " + vehicle.inv_make + " " + vehicle.inv_model + " Details</h3>"
  svd += '<ul id="vehicle-details">'
  svd +=
    "<li><h4>Price: $" +
    new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
    "</h4></li>"
  svd += "<li><h4>Description:</h4> " + vehicle.inv_description + "</li>"
  svd += "<li><h4>Color:</h4> " + vehicle.inv_color + "</li>"
  svd +=
    "<li><h4>Miles:</h4> " +
    new Intl.NumberFormat("en-US").format(vehicle.inv_miles) +
    "</li>"
  svd += "</ul>"
  svd += "</section>"
  svd += "</div>"
  svd += "</section>"
  return svd
}

function buildVehicleDetail(data) {
  return `
    <div class="vehicle-detail">
      
      <div class="vehicle-image">
        <img src="${data.inv_image}" alt="${data.inv_make} ${data.inv_model}">
      </div>

      <div class="vehicle-info">
        <h2>${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>

        <p class="price">Price: $${new Intl.NumberFormat("en-US").format(data.inv_price)}</p>

        <p>Mileage: ${new Intl.NumberFormat("en-US").format(data.inv_miles)} miles</p>

        <p>Color: ${data.inv_color}</p>

        <p class="description">${data.inv_description}</p>
      </div>

    </div>
  `
}



function handleErrors(fn) {
  return (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)
}



/* ****************************************


 * Middleware For Handling Errors


 * Wrap other function in this for 


 * General Error Handling


 **************************************** */


Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let list = '<select name="classification_id" id="classificationList" required>'
  list += "<option value=''>Choose a Classification</option>"

  data.rows.forEach(row => {
    list += `<option value="${row.classification_id}"`
    if (classification_id == row.classification_id) list += " selected"
    list += `>${row.classification_name}</option>`
  })

  list += "</select>"
  return list
}

/* ****************************************
* Middleware to check token validity
**************************************** */


Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        res.locals.loggedin = false
        next()
      } else {
        res.locals.loggedin = true
        res.locals.accountData = accountData
        next()
      }
    })
  } else {
    res.locals.loggedin = false
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  console.log("checkLogin middleware running......")
  console.log("res.locals.loggedin value: ", res.locals.loggedin)
  if (res.locals.loggedin) {
    console.log("User is logged in,proceeding...")
    next()
  } else {
    console.log("User is not logged in, redirecting to login page...")
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

 /* ****************************************
 *  Check Account Type (Employee or Admin)
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  const accountType = res.locals.accountData.account_type
  if (accountType === 'Employee' || accountType === 'Admin') {
    next()
  } else {
    req.flash("notice", "You do not have permission to access this page.")
    return res.redirect("/account/login")
  }
}

module.exports = Util