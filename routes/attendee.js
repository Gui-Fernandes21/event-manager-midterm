/**
 * /routes/attendee.js
 * Routes for attendee functionality - viewing and booking events
 */

const express = require("express");
const router = express.Router();

const attendeeControllers = require("../controllers/attendee");


// GET ROUTES ---------------------------------------------------------------------

router.get("/", attendeeControllers.getAttendeeHome);

router.get("/event/:id", attendeeControllers.getEventDetails);

// POST ROUTES --------------------------------------------------------------------

router.post("/event/:id/book", attendeeControllers.postEventBooking);

module.exports = router;
