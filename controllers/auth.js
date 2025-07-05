const {
	createUserSession,
	destroyUserSession,
} = require("../middlewares/auth");

exports.logout = (req, res) => {
	destroyUserSession(req, (err) => {
		if (err) {
			console.error("Session destruction error:", err);
		}
		res.redirect("/auth/login");
	});
};

exports.register = (req, res, next) => {
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
};

exports.login = (req, res, next) => {
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
};
