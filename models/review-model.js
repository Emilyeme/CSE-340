const pool = require("../database/")

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(inv_id, account_id, review_text, review_rating) {
  try {
    const sql = "INSERT INTO review (review_text, inv_id, account_id, review_rating) VALUES ($1, $2, $3, $4) RETURNING *"
    return await pool.query(sql, [review_text, inv_id, account_id, review_rating])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get all reviews for a specific vehicle
 * ************************** */
async function getReviewsByInvId(inv_id) {
  try {
    // We JOIN with the account table so we can display the reviewer's name
    const sql = `
      SELECT r.review_id, r.review_text, r.review_date, r.review_rating, a.account_firstname 
      FROM review r 
      JOIN account a ON r.account_id = a.account_id 
      WHERE r.inv_id = $1 
      ORDER BY r.review_date DESC`
    const data = await pool.query(sql, [inv_id])
    return data.rows
  } catch (error) {
    console.error("Error getting reviews: " + error)
    return []
  }
}

module.exports = { addReview, getReviewsByInvId }