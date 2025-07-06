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
router.get("/", (req, res, next) => {
  if (!req.session || !req.session.user_id) {
    res.redirect("/auth/login");
    return;
  }
  
  // Get site settings
  const settingsQuery = "SELECT site_name, site_description FROM site_settings ORDER BY id DESC LIMIT 1";
  
  global.db.get(settingsQuery, (err, settings) => {
    if (err) {
      next(err);
      return;
    }

    // Use default settings if none exist
    if (!settings) {
      settings = {
        site_name: 'EventFlow Manager',
        site_description: 'Professional event management for all your needs'
      };
    }

    res.render("home.ejs", {
      title: `${settings.site_name} - Home`,
      siteInfo: {
        name: settings.site_name,
        description: settings.site_description
      }
    });
  });
});

module.exports = router;
