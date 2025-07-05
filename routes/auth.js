/**
 * auth.js - Authentication routes
 * Handles login, logout, and registration functionality
 */

const express = require("express");
const router = express.Router();
const { redirectIfAuthenticated } = require("../middlewares/auth");

const authControllers = require("../controllers/auth");

// GET ROUTES ---------------------------------------------------------------------

router.get("/login", redirectIfAuthenticated, (req, res) => {
	res.render("auth/login.ejs", {
		title: "Login",
		error: null,
	});
});

router.get("/register", redirectIfAuthenticated, (req, res) => {
	res.render("auth/register.ejs", {
		title: "Register",
		error: null,
	});
});

// POST ROUTES --------------------------------------------------------------------

router.post("/login", redirectIfAuthenticated, authControllers.login);

router.post("/register", redirectIfAuthenticated, authControllers.register);

router.post("/logout", authControllers.logout);

router.get("/logout", authControllers.logout);

module.exports = router;
