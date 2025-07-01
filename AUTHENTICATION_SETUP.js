/**
 * SETUP INSTRUCTIONS FOR AUTHENTICATION
 *
 * To integrate the authentication middleware into your application,
 * follow these steps in your index.js file:
 */

// 1. Install required packages (run these commands in your terminal):
// npm install express-session

// 2. Update your index.js file with the following code:

const express = require("express");
const session = require("express-session");
const app = express();
const port = 3000;
var bodyParser = require("body-parser");

// Import authentication middleware
const { loadUser, getSessionConfig } = require("./middlewares/auth");

// Set up express, bodyparser and EJS
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// Set up session middleware (IMPORTANT: Add this BEFORE your routes)
app.use(session(getSessionConfig()));

// Set up SQLite
const sqlite3 = require("sqlite3").verbose();
global.db = new sqlite3.Database("./database.db", function (err) {
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log("Database connected");
		global.db.run("PRAGMA foreign_keys=ON");
	}
});

// Load user information for all requests (makes user data available in views)
app.use(loadUser);

// Handle requests to the home page
app.get("/", (req, res) => {
	// Redirect to login if not authenticated, otherwise to users list
	if (req.session && req.session.user_id) {
		res.redirect("/users/list-users");
	} else {
		res.redirect("/auth/login");
	}
});

// Add authentication routes
const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Add user routes (now protected by authentication)
const usersRoutes = require("./routes/users");
app.use("/users", usersRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send("Something broke!");
});

// Make the web application listen for HTTP requests
app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
	console.log(`Visit http://localhost:${port} to get started`);
});

/**
 * OPTIONAL: Update your database schema to support admin users
 *
 * Add this to your db_schema.sql if you want admin functionality:
 *
 * ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0;
 *
 * Then you can use the requireAdmin middleware for admin-only routes.
 */
