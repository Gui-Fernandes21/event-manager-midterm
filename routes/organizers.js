/**
 * organizers.js
 * Routes for event organizer functionality
 * Handles creating, editing, publishing, and managing events
 */

const express = require("express");
const router = express.Router();
const organizerControllers = require("../controllers/organizers");

// GET ROUTES ---------------------------------------------------------------------

router.get("/", organizerControllers.getOrganizerPage);

router.get("/sharing-link/:id", organizerControllers.getShareLink);

router.get("/edit-event/:id", organizerControllers.getEditEvent);

router.get("/create-event", organizerControllers.createEvent);
 
router.get("/settings", organizerControllers.getSettings);

// POST ROUTES ---------------------------------------------------------------------

router.post("/edit-event/:id", organizerControllers.postEditEvent);

router.post("/publish-event/:id", organizerControllers.publishEvent);

router.post("/delete-event/:id", organizerControllers.deleteEvent);

router.post("/settings", organizerControllers.postSettings);

module.exports = router;
 