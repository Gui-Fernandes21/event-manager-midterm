/**
 * /middlewares/auth.js
 * Authentication middleware for checking if users are authenticated
 * This middleware provides session-based authentication functionality
 */


/**
 * Middleware to check if user is authenticated
 */
const requireAuth = (req, res, next) => {
	// Check if user session exists and has a valid user_id
	if (req.session && req.session.user_id) {
		// User is authenticated, proceed to next middleware
		return next();
	} else {
		// User is not authenticated
		// Store the original URL they were trying to access
		req.session.returnTo = req.originalUrl;

		// Redirect to login page
		return res.redirect("/auth/login");
	}
};

/**
 * Middleware to check if user is already authenticated (for login/register pages)
 * Redirects to dashboard if already logged in
 */
const redirectIfAuthenticated = (req, res, next) => {
	if (req.session && req.session.user_id) {
		// User is already authenticated, redirect to dashboard or users list
		return res.redirect("/");
	} else {
		// User is not authenticated, proceed to login/register page
		return next();
	}
};

/**
 * Middleware to make user information available in all views
 * Adds user data to res.locals so it can be accessed in EJS templates
 */
const loadUser = (req, res, next) => {
	if (req.session && req.session.user_id) {
		// Query database to get current user information
		const query = "SELECT user_id, user_name FROM users WHERE user_id = ?";

		global.db.get(query, [req.session.user_id], (err, user) => {
			if (err) {
				console.error("Error loading user:", err);
				// Clear invalid session
				req.session.destroy();
				res.locals.user = null;
			} else if (user) {
				// User found, make available to the application
				res.locals.user_id = user.user_id;
				res.locals.user = user;
				res.locals.isAuthenticated = true;
			} else {
				// User not found in database, clear session
				req.session.destroy();
				res.locals.user = null;
				res.locals.isAuthenticated = false;
			}
			next();
		});
	} else {
		// No session, user not authenticated
		res.locals.user = null;
		res.locals.isAuthenticated = false;
		next();
	}
};

/**
 * Middleware to check if user has admin privileges
 * Requires user to be authenticated first
 */
const requireAdmin = (req, res, next) => {
	// First check if user is authenticated
	if (!req.session || !req.session.user_id) {
		req.session.returnTo = req.originalUrl;
		return res.redirect("/auth/login");
	}

	// Check if user is admin (you can modify this logic based on your user schema)
	const query =
		"SELECT user_id, user_name, is_admin FROM users WHERE user_id = ? AND is_admin = 1";

	global.db.get(query, [req.session.user_id], (err, user) => {
		if (err) {
			console.error("Error checking admin status:", err);
			return res.status(500).send("Server error");
		}

		if (user) {
			// User is admin, proceed
			return next();
		} else {
			// User is not admin, deny access
			return res.status(403).render("error", {
				message: "Access Denied",
				error: "You do not have permission to access this resource.",
			});
		}
	});
};

/**
 * Helper function to create user session
 */
const createUserSession = (req, user) => {
	req.session.user_id = user.user_id;
	req.session.user_name = user.user_name;
	req.session.logged_in = true;
};

/**
 * Helper function to destroy user session
 */
const destroyUserSession = (req, callback) => {
	req.session.destroy(callback);
};

/**
 * Middleware to handle session configuration
 * Call this function to get session configuration object
 */
const getSessionConfig = () => {
	return {
		secret:
			process.env.SESSION_SECRET || "super-secret-key",
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: false, 
			httpOnly: true,
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
		},
	};
};

/** * Middleware to check if user has a specific role
 * @param {string} role - The required role (e.g., 'admin', 'organizer', 'attendee', etc.)
 * @returns {Function} Middleware function
 */
const requireRole = (role) => {
	return (req, res, next) => {
		if (!req.session || !req.session.user_id) {
			req.session.returnTo = req.originalUrl;
			return res.redirect("/auth/login");
		}

		const query =
			"SELECT user_id, user_name, role FROM users WHERE user_id = ?";

		global.db.get(query, [req.session.user_id], (err, user) => {
			if (err) {
				console.error("Error checking user role:", err);
				return res.status(500).send("Server error");
			}

			if (user && user.role === role) {
				return next();
			} else {
				return res.status(403).render("error", {
					message: "Access Denied",
					error: `You need ${role} privileges to access this resource.`,
				});
			}
		});
	};
};

module.exports = {
	requireAuth,
	redirectIfAuthenticated,
	loadUser,
	requireAdmin,
	createUserSession,
	destroyUserSession,
	getSessionConfig,
	requireRole,
};

