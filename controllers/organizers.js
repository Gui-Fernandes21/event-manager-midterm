/**
 * @desc Display Organizer Home Page
 * Shows published and draft events with management options
 */
exports.getOrganizerPage = (req, res, next) => {
	// Get both published and draft events
	const publishedQuery =
		"SELECT * FROM events WHERE status = 'published' ORDER BY date ASC";
	const draftQuery =
		"SELECT * FROM events WHERE status = 'draft' ORDER BY createdAt DESC";

	// Execute both queries
	global.db.all(publishedQuery, (err, publishedEvents) => {
		if (err) {
			next(err);
			return;
		}

		global.db.all(draftQuery, (err, draftEvents) => {
			if (err) {
				next(err);
				return;
			}

			// Render the organizer home page with both sets of events
			res.render("organizer/home.ejs", {
				title: "Organizer Dashboard",
				publishedEvents: publishedEvents,
				draftEvents: draftEvents,
				siteInfo: {
					name: "EventFlow Manager",
					description: "Professional event management for all your needs",
				},
			});
		});
	});
};

/**
 * @desc Create New Event
 * Creates a new draft event and redirects to its edit page
 */
exports.createEvent = (req, res, next) => {
	const now = new Date().toISOString();
	const defaultDate = new Date();
	defaultDate.setDate(defaultDate.getDate() + 7); // Default to 1 week from now

	const query = `INSERT INTO events (title, description, date, createdAt, status, tickets_general, tickets_vip) 
                   VALUES (?, ?, ?, ?, 'draft', 0, 0)`;

	const params = [
		"New Event",
		"Event description",
		defaultDate.toISOString(),
		now,
	];

	global.db.run(query, params, function (err) {
		if (err) {
			next(err);
		} else {
			// Redirect to edit page for the newly created event
			res.redirect(`/organizer/edit-event/${this.lastID}`);
		}
	});
};

/**
 * @desc Display Event Edit Page
 * Shows form to edit event details
 */
exports.getEditEvent = (req, res, next) => {
	const eventId = req.params.id;
	const query = "SELECT * FROM events WHERE event_id = ?";

	global.db.get(query, [eventId], (err, event) => {
		if (err) {
			next(err);
		} else if (!event) {
			res.status(404).send("Event not found");
		} else {
			// Format date for HTML input
			const eventDate = new Date(event.date);
			const formattedDate = eventDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format

			res.render("organizer/edit-event.ejs", {
				title: "Edit Event",
				event: event,
				formattedDate: formattedDate,
			});
		}
	});
};

/**
 * @desc Update Event
 * Handles form submission to update event details
 */
exports.postEditEvent = (req, res, next) => {
	const eventId = req.params.id;
	const { title, description, date, tickets_general, tickets_vip } = req.body;

	const query = `UPDATE events 
                   SET title = ?, description = ?, date = ?, tickets_general = ?, tickets_vip = ?
                   WHERE event_id = ?`;

	const params = [
		title,
		description,
		date,
		parseInt(tickets_general) || 0,
		parseInt(tickets_vip) || 0,
		eventId,
	];

	global.db.run(query, params, function (err) {
		if (err) {
			next(err);
		} else {
			res.redirect("/organizer");
		}
	});
};

/**
 * @desc Publish Event
 * Changes event status from draft to published and sets publication timestamp
 */
exports.publishEvent = (req, res, next) => {
	const eventId = req.params.id;
	const publishedAt = new Date().toISOString();

	const query =
		"UPDATE events SET status = 'published', publishedAt = ? WHERE event_id = ? AND status = 'draft'";

	global.db.run(query, [publishedAt, eventId], function (err) {
		if (err) {
			next(err);
		} else {
			res.redirect("/organizer");
		}
	});
};

/**
 * @desc Delete Event
 * Removes event from database
 */ 
exports.deleteEvent = (req, res, next) => {
	const eventId = req.params.id;

	// First delete any bookings for this event
	const deleteBookingsQuery = "DELETE FROM bookings WHERE eventId = ?";

	global.db.run(deleteBookingsQuery, [eventId], (err) => {
		if (err) {
			next(err);
			return;
		}

		// Then delete the event
		const deleteEventQuery = "DELETE FROM events WHERE event_id = ?";

		global.db.run(deleteEventQuery, [eventId], function (err) {
			if (err) {
				next(err);
			} else {
				res.redirect("/organizer");
			}
		});
	});
};

/**
 * @desc Get sharing link for event
 * Returns the attendee view URL for an event
 */
exports.getShareLink = (req, res, next) => {
	const eventId = req.params.id;
	const query =
		"SELECT event_id, title FROM events WHERE event_id = ? AND status = 'published'";

	global.db.get(query, [eventId], (err, event) => {
		if (err) {
			next(err);
		} else if (!event) {
			res.status(404).json({ error: "Event not found or not published" });
		} else {
			const sharingLink = `${req.protocol}://${req.get(
				"host"
			)}/attendee/event/${eventId}`;
			res.json({
				eventId: event.event_id,
				title: event.title,
				sharingLink: sharingLink,
			});
		}
	});
};

/** 
 * @desc Get Site Settings
 * Renders the settings page for the organizer
*/
exports.getSettings = (req, res, next) => {
  // Render the settings page
  res.render("organizer/settings.ejs", {
    title: "Site Settings",
    siteInfo: {
      name: "EventFlow Manager",
      description: "Professional event management for all your needs",
    },
  });
};