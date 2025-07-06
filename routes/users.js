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

const userControllers = require("../controllers/user");

// GET ROUTES ---------------------------------------------------------------

router.get("/list-users", userControllers.listUsers);

router.get("/add-user", (req, res) => res.render("add-user.ejs"));

// POST ROUTES --------------------------------------------------------------

router.post("/add-user", userControllers.addUserPost);

module.exports = router;
