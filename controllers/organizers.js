/**
 * /controllers/organizers.js
 * Organizer management controller
 * This file contains functions to handle organizer-related operations such as viewing and managing events.
 */

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
	const settingsQuery = "SELECT * FROM site_settings ORDER BY id DESC LIMIT 1";

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

			// Get site settings
			global.db.get(settingsQuery, (err, settings) => {
				if (err) {
					next(err);
					return;
				}

				// Use default settings if none exist
				if (!settings) {
					settings = {
						site_name: "EventFlow Manager",
						site_description:
							"Professional event management for all your needs",
					};
				}

				// Render the organizer home page with both sets of events
				res.render("organizer/home.ejs", {
					title: "Organizer Dashboard",
					publishedEvents: publishedEvents,
					draftEvents: draftEvents,
					siteInfo: {
						name: settings.site_name,
						description: settings.site_description,
					},
				});
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

	// Get settings to use default ticket values
	const settingsQuery =
		"SELECT default_general_tickets, default_vip_tickets FROM site_settings ORDER BY id DESC LIMIT 1";

	global.db.get(settingsQuery, (err, settings) => {
		if (err) {
			next(err);
			return;
		}

		// Use default values if no settings exist
		const defaultGeneral = settings ? settings.default_general_tickets : 50;
		const defaultVip = settings ? settings.default_vip_tickets : 10;

		const query = `INSERT INTO events (title, description, date, createdAt, status, tickets_general, tickets_vip) 
		               VALUES (?, ?, ?, ?, 'draft', ?, ?)`;

		const params = [
			"New Event",
			"Event description",
			defaultDate.toISOString(),
			now,
			defaultGeneral,
			defaultVip,
		];

		global.db.run(query, params, function (err) {
			if (err) {
				next(err);
			} else {
				// Redirect to edit page for the newly created event
				res.redirect(`/organizer/edit-event/${this.lastID}`);
			}
		});
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
			)}/attendees/event/${eventId}`;
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
	// Get current settings from database
	const settingsQuery = "SELECT * FROM site_settings ORDER BY id DESC LIMIT 1";

	// Get statistics for the dashboard
	const statsQueries = {
		totalEvents: "SELECT COUNT(*) as count FROM events",
		publishedEvents:
			"SELECT COUNT(*) as count FROM events WHERE status = 'published'",
		draftEvents: "SELECT COUNT(*) as count FROM events WHERE status = 'draft'",
		totalBookings: "SELECT COUNT(*) as count FROM bookings",
	};

	global.db.get(settingsQuery, (err, settings) => {
		if (err) {
			next(err);
			return;
		}

		// If no settings exist, use defaults
		if (!settings) {
			settings = {
				site_name: "EventFlow Manager",
				site_description: "Professional event management for all your needs",
				default_general_tickets: 50,
				default_vip_tickets: 10,
				contact_email: "",
				contact_phone: "",
				booking_instructions:
					"Please review the event details carefully before booking. Bring a valid ID to the event.",
				require_booking_notes: 0,
				show_remaining_tickets: 1,
			};
		}

		// Get statistics
		const stats = {};
		let completedQueries = 0;
		const totalQueries = Object.keys(statsQueries).length;

		Object.keys(statsQueries).forEach((key) => {
			global.db.get(statsQueries[key], (err, result) => {
				if (!err && result) {
					stats[key] = result.count;
				} else {
					stats[key] = 0;
				}

				completedQueries++;

				if (completedQueries === totalQueries) {
					// Render the settings page with data
					res.render("organizer/settings.ejs", {
						title: "Site Settings",
						siteInfo: {
							name: settings.site_name,
							description: settings.site_description,
						},
						settings: settings,
						stats: stats,
					});
				}
			});
		});
	});
};

/**
 * @desc Update Site Settings
 * Updates site settings in the database
 */
exports.postSettings = (req, res, next) => {
	const {
		site_name,
		site_description,
		default_general_tickets,
		default_vip_tickets,
		contact_email,
		contact_phone,
		booking_instructions,
		require_booking_notes,
		show_remaining_tickets,
	} = req.body;

	// Validate required fields
	if (!site_name || site_name.trim() === "") {
		return res.status(400).json({ error: "Site name is required" });
	}

	const updateQuery = `
    UPDATE site_settings 
    SET site_name = ?, 
        site_description = ?, 
        default_general_tickets = ?, 
        default_vip_tickets = ?, 
        contact_email = ?, 
        contact_phone = ?, 
        booking_instructions = ?, 
        require_booking_notes = ?, 
        show_remaining_tickets = ?, 
        updated_at = datetime('now')
    WHERE id = (SELECT id FROM site_settings ORDER BY id DESC LIMIT 1)
  `;

	const values = [
		site_name.trim(),
		site_description || "",
		parseInt(default_general_tickets) || 50,
		parseInt(default_vip_tickets) || 10,
		contact_email || "",
		contact_phone || "",
		booking_instructions ||
			"Please review the event details carefully before booking. Bring a valid ID to the event.",
		require_booking_notes ? 1 : 0,
		show_remaining_tickets ? 1 : 0,
	];

	global.db.run(updateQuery, values, function (err) {
		if (err) {
			next(err);
			return;
		}

		// If no rows were affected, create new settings
		if (this.changes === 0) {
			const insertQuery = `
        INSERT INTO site_settings (
          site_name, site_description, default_general_tickets, default_vip_tickets,
          contact_email, contact_phone, booking_instructions, require_booking_notes,
          show_remaining_tickets, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;

			global.db.run(insertQuery, values, function (err) {
				if (err) {
					next(err);
					return;
				}

				res.redirect("/organizer/settings?saved=true");
			});
		} else {
			res.redirect("/organizer/settings?saved=true");
		}
	});
};
