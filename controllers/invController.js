const utilities = require('../utilities')

async function buildAddClassification(req, res) {
  let nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null
  })
}

exports.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()
  res.render('inventory/add-classification', {
    title: 'Add Classification',
    nav,
    errors: null,
    classification_name: ''
  })
}

exports.addClassification = async (req, res) => {
  const nav = await utilities.getNav()
  const { classification_name } = req.body
  // insert into DB, handle errors, then flash message
  // Example:
  req.flash('success', `${classification_name} added successfully!`)
  res.redirect('/inv/')
}