/**
 * auth.js - Authentication routes
 * Handles login, logout, and registration functionality
 */

const express = require("express");
const router = express.Router();
const {
	redirectIfAuthenticated,
	createUserSession,
	destroyUserSession,
} = require("../middlewares/auth");

/**
 * @desc Display login form
 */
router.get("/login", redirectIfAuthenticated, (req, res) => {
	res.render("auth/login.ejs", {
		title: "Login",
		error: null,
	});
});

/**
 * @desc Handle login form submission
 */
router.post("/login", redirectIfAuthenticated, (req, res, next) => {
	const { user_name, password } = req.body;

	// Basic validation
	if (!user_name) {
		return res.render("auth/login.ejs", {
			title: "Login",
			error: "Username is required",
		});
	}

	// For this simple example, we'll just check if user exists
	// In a real application, you would check password hash
	const query = "SELECT user_id, user_name FROM users WHERE user_name = ?";

	global.db.get(query, [user_name], (err, user) => {
		if (err) {
			next(err);
		} else if (user) {
			// User found, create session
			createUserSession(req, user);

			// Redirect to originally requested page or default
			const redirectTo = req.session.returnTo || "/users/list-users";
			delete req.session.returnTo;
			res.redirect(redirectTo);
		} else {
			// User not found
			res.render("auth/login.ejs", {
				title: "Login",
				error: "User not found",
			});
		}
	});
});

/**
 * @desc Display registration form
 */
router.get("/register", redirectIfAuthenticated, (req, res) => {
	res.render("auth/register.ejs", {
		title: "Register",
		error: null,
	});
});

/**
 * @desc Handle registration form submission
 */
router.post("/register", redirectIfAuthenticated, (req, res, next) => {
	const { user_name, password, confirm_password } = req.body;

	// Basic validation
	if (!user_name) {
		return res.render("auth/register.ejs", {
			title: "Register",
			error: "Username is required",
		});
	}

	// Check if user already exists
	const checkQuery = "SELECT user_id FROM users WHERE user_name = ?";

	global.db.get(checkQuery, [user_name], (err, existingUser) => {
		if (err) {
			next(err);
		} else if (existingUser) {
			res.render("auth/register.ejs", {
				title: "Register",
				error: "Username already exists",
			});
		} else {
			// Create new user
			const insertQuery = "INSERT INTO users (user_name) VALUES (?)";

			global.db.run(insertQuery, [user_name], function (err) {
				if (err) {
					next(err);
				} else {
					// User created successfully, create session
					const newUser = {
						user_id: this.lastID,
						user_name: user_name,
					};

					createUserSession(req, newUser);
					res.redirect("/users/list-users");
				}
			});
		}
	});
});

/**
 * @desc Handle logout
 */
router.post("/logout", (req, res) => {
	destroyUserSession(req, (err) => {
		if (err) {
			console.error("Session destruction error:", err);
		}
		res.redirect("/auth/login");
	});
});

/**
 * @desc Logout via GET (for convenience)
 */
router.get("/logout", (req, res) => {
	destroyUserSession(req, (err) => {
		if (err) {
			console.error("Session destruction error:", err);
		}
		res.redirect("/auth/login");
	});
});

module.exports = router;
