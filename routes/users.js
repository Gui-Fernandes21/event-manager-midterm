/**
 * users.js
 * These are example routes for user management
 * This shows how to correctly structure your routes for the project
 * and the suggested pattern for retrieving data by executing queries
 *
 * NB. it's better NOT to use arrow functions for callbacks with the SQLite library
 *
 */

const express = require("express");
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');

const userControllers = require("../controllers/user");

// Apply authentication middleware to all user routes
router.use(requireAuth);

/**
 * @desc Display all the users
 */
router.get("/list-users", userControllers.listUsers);

/**
 * @desc Displays a page with a form for creating a user record
 */
router.get("/add-user", (req, res) => res.render("add-user.ejs"));

/**
 * @desc Add a new user to the database based on data from the submitted form
 */
router.post("/add-user", userControllers.addUserPost);

module.exports = router;
