/* ***************************
 * Required Resources
 *****************************/
const jwt = require("jsonwebtoken")
require("dotenv").config()

const utilities = require("../utilities/")

const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

 /* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      console.log("LOGIN SUCCESSFUL - setting cookie")
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


//  UPDATE buildAccountManagement 
async function buildAccountManagement(req, res) {
  let nav = await utilities.getNav()
  // res.locals.accountData is set by your JWT middleware!
  const firstName = res.locals.accountData.account_firstname
  const accountType = res.locals.accountData.account_type

  res.render("account/account-management", {
    title: "Account Management",
    nav,
    errors: null,
    firstName: firstName,
    accountType: accountType,
    account_id: res.locals.accountData.account_id
  })
}



async function registerAccount(req, res) {
  let nav = await utilities.getNav()

  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password
  } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [{ msg: "Sorry, there was an error processing your request." }]
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered.`)
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: [{ msg: "Registration failed." }]
    })
  }
}

// 2. LOGOUT FUNCTION (Task 6)
async function accountLogout(req, res) {
  res.clearCookie("jwt") // Deletes the JWT cookie
  res.redirect("/")       // Sends them home
}

// 3. BUILD UPDATE VIEW (Task 4 & 5)
async function buildAccountUpdate(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  
  res.render("account/update-account", {
    title: "Update Account",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email
  })
}

// 4. PROCESS ACCOUNT UPDATE (Task 5)
async function updateAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  const updateResult = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    // Re-query to get the fresh data to update the JWT locals
    const newData = await accountModel.getAccountById(account_id)
    req.flash("notice", "Account information updated successfully.")
    res.locals.accountData = newData // Update local session data
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("account/update-account", {
      title: "Update Account",
      nav,
      errors: null,
      account_id, account_firstname, account_lastname, account_email
    })
  }
}

// 5. PROCESS PASSWORD UPDATE (Task 5)
async function updatePassword(req, res) {
  let nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing your request.")
    return res.status(501).redirect("/account/update/" + account_id)
  }

  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
    return res.status(501).redirect("/account/update/" + account_id)
  }
}



module.exports = { buildLogin, buildRegister ,buildAccountManagement ,registerAccount, accountLogin, accountLogout, buildAccountUpdate, updateAccount, updatePassword }
