const express = require("express");
const router = express.Router();

// Import authentication middleware
const { requireAuth } = require("../middlewares/auth");

// Import routes
const authRoutes = require("./auth");
const usersRoutes = require("./users");
const organizerRoutes = require("./organizers");
const attendeeRoutes = require("./attendee");

router.use("/auth", authRoutes);

// Apply authentication middleware to following routes
router.use(requireAuth);

router.use("/users", usersRoutes);

router.use("/organizer", organizerRoutes);

router.use("/attendees", attendeeRoutes);

// Handle requests to the home page
router.get("/", (req, res) => {
  if (!req.session || !req.session.user_id) res.redirect("/auth/login");  
	res.render("home.ejs", {
		title: "EventFlow Manager - Home",
		siteInfo: {
			name: "EventFlow Manager",
			description: "Professional event management for all your needs"
		}
	});
});

module.exports = router;
