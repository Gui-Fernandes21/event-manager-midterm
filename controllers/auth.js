/**
 * /routes/auth.js - Authentication routes
 * Handles login, logout, and registration functionality
 */

const {
	createUserSession,
	destroyUserSession,
} = require("../middlewares/auth");

const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.logout = (req, res) => {
	destroyUserSession(req, (err) => {
		if (err) return console.error("Session destruction error:", err);
		res.redirect("/auth/login");
	});
};

exports.register = (req, res, next) => {
	const { user_name, email, password, confirm_password } = req.body;

	// Basic validation
	if (!user_name) {
		return res.render("auth/register.ejs", {
			title: "Register",
			error: "Username is required",
		});
	}

	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		return res.render("auth/register.ejs", {
			title: "Register",
			error: "Valid email is required",
		});
	}

	if (!password) {
		return res.render("auth/register.ejs", {
			title: "Register",
			error: "Password is required",
		});
	}

	if (password !== confirm_password) {
		return res.render("auth/register.ejs", {
			title: "Register",
			error: "Passwords do not match",
		});
	}

	// Hash the password
	bcrypt.hash(password, saltRounds, (err, hash) => {
		if (err) {
			return next(err);
		}

		// Store the new user in the database
		const insertQuery = "INSERT INTO users (user_name, email, password, role, createdAt) VALUES (?, ?, ?, ?, ?)";

		global.db.run(insertQuery, [user_name, email, hash, "attendee", new Date().toISOString()], function (err) {
				if (err) {
					return next(err);
				}

				// User created successfully, create session
				const newUser = {
					user_id: this.lastID,
					user_name: user_name,
					email: email,
				};

				createUserSession(req, newUser);
				res.redirect("/");
			}
		);
	});
};

exports.login = (req, res, next) => {
	const { user_name, password } = req.body;

	// Basic validation
	if (!user_name || user_name.trim() === "") {
		return res.render("auth/login.ejs", {
			title: "Login",
			error: "Username is required",
		});
	}
	if (!password || password.trim() === "") {
		return res.render("auth/login.ejs", {
			title: "Login",
			error: "Password is required",
		});
	}

	const query =
		"SELECT user_id, user_name, password FROM users WHERE user_name = ?";

	global.db.get(query, [user_name], (err, user) => {
		if (err) return next(err);
		if (!user) {
			return res.render("auth/login.ejs", {
				title: "Login",
				error: "User not found",
			});
		}

		// User found, verify password
		bcrypt.compare(password, user.password, (err, isMatch) => {
			if (err) return next(err);
			if (!isMatch) {
				console.log("Password mismatch for user:", user_name);
				return res.render("auth/login.ejs", {
					title: "Login",
					error: "Invalid username or password",
				});
			}
			// Passwords match, create session
			createUserSession(req, user);

			res.redirect("/");
		});
	});
};
