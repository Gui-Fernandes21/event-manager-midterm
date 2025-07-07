/**
 * /routes/attendee.js
 * Routes for attendee functionality - viewing and booking events
 */

const { format, parseISO } = require("date-fns");

/**
 * @desc Attendee Home Page
 * Display all published events ordered by date
 */
exports.getAttendeeHome = (req, res, next) => {
	// Get all published events ordered by date (earliest first)
	const query = `SELECT event_id, title, description, date, tickets_general, tickets_vip, publishedAt
                   FROM events 
                   WHERE status = 'published' 
                   ORDER BY date ASC`;

	// Get site settings
	const settingsQuery =
		"SELECT site_name, site_description FROM site_settings ORDER BY id DESC LIMIT 1";

	global.db.all(query, (err, events) => {
		if (err) {
			next(err);
			return;
		}

		global.db.get(settingsQuery, (err, settings) => {
			if (err) {
				next(err);
				return;
			}

			// Use default settings if none exist
			if (!settings) {
				settings = {
					site_name: "EventFlow Manager",
					site_description: "Professional event management for all your needs",
				};
			}

			// If no events found, render home page with empty events array
			if (events.length === 0) {
				res.render("attendee/home.ejs", {
					title: "Attendee Home Page",
					events: [],
					siteInfo: {
						name: settings.site_name,
						description: settings.site_description,
					},
					settings,
				});
			}

      let processedEvents = 0;
			const eventsWithTickets = [];

			events.forEach((event, index) => {
				// Get bookings for this specific event
				const bookingsQuery = `SELECT 
                                  SUM(CASE WHEN ticket_type = 'general' THEN quantity ELSE 0 END) as general_booked,
                                  SUM(CASE WHEN ticket_type = 'vip' THEN quantity ELSE 0 END) as vip_booked
                                  FROM bookings WHERE eventId = ?`;
				global.db.get(bookingsQuery, [event.event_id], (err, bookings) => {
					if (err) {
						next(err);
						return;
					}
					// Calculate remaining tickets
					const generalBooked = bookings.general_booked || 0;
					const vipBooked = bookings.vip_booked || 0;

					const remainingGeneral = Math.max(
						0,
						event.tickets_general - generalBooked
					);
					const remainingVip = Math.max(0, event.tickets_vip - vipBooked);

					const eventWithTickets = {
						...event,
						remainingTickets: {
							general: remainingGeneral,
							vip: remainingVip,
						},
						totalBooked: {
							general: generalBooked,
							vip: vipBooked,
						},
						// Calculate availability status
						isAvailable: remainingGeneral > 0 || remainingVip > 0,
						isSoldOut: remainingGeneral === 0 && remainingVip === 0,
					};

          eventsWithTickets[index] = eventWithTickets;
					processedEvents++;

					if (processedEvents === events.length) {
						// All events have been processed
						res.render("attendee/home.ejs", {
							title: "Attendee Home Page",
							events: eventsWithTickets,
							siteInfo: {
								name: settings.site_name,
								description: settings.site_description,
							},
							settings: settings,
						});
					}
				});
			});
		});
	});
};

/**
 * @desc Attendee Event Page
 * Display single event details and booking form
 */
exports.getEventDetails = (req, res, next) => {
	const eventId = req.params.id;

	// Get event details
	const eventQuery = `SELECT * FROM events WHERE event_id = ? AND status = 'published'`;

	global.db.get(eventQuery, [eventId], (err, event) => {
		if (err) {
			next(err);
		} else if (!event) {
			res.status(404).render("error", {
				message: "Event Not Found",
				error: "This event does not exist or is not available for booking.",
			});
		} else {
			// Get existing bookings to calculate remaining tickets
			const bookingsQuery = `SELECT 
                                    SUM(CASE WHEN ticket_type = 'general' THEN quantity ELSE 0 END) as general_booked,
                                    SUM(CASE WHEN ticket_type = 'vip' THEN quantity ELSE 0 END) as vip_booked
                                   FROM bookings WHERE eventId = ?`;

			// Get site settings for booking instructions
			const settingsQuery =
				"SELECT site_name, site_description, booking_instructions, show_remaining_tickets FROM site_settings ORDER BY id DESC LIMIT 1";

			global.db.get(bookingsQuery, [eventId], (err, bookings) => {
				if (err) {
					next(err);
					return;
				}

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
							booking_instructions:
								"Please review the event details carefully before booking. Bring a valid ID to the event.",
							show_remaining_tickets: 1,
						};
					}

          console.log(event);
          

					// Calculate remaining tickets
					const generalBooked = bookings.general_booked || 0;
					const vipBooked = bookings.vip_booked || 0;

					const remainingGeneral = Math.max(
						0,
						event.tickets_general - generalBooked
					);
					const remainingVip = Math.max(0, event.tickets_vip - vipBooked);

					const dateObj = parseISO(event.date);

					const formattedEventDate = format(dateObj, "EEEE, MMMM d, yyyy");
					const formattedEventTime = format(dateObj, "h:mm a");

					const publishedAtObj = parseISO(event.publishedAt);
					const formattedPublishedAt = format(
						publishedAtObj,
						"MMMM d, yyyy 'at' h:mm a"
					);

					res.render("attendee/event.ejs", {
						title: `${event.title} - Event Details`,
						event: event,
						formattedEventDate: formattedEventDate,
						formattedEventTime: formattedEventTime,
						formattedPublishedAt: formattedPublishedAt,
						remainingTickets: {
							general: remainingGeneral,
							vip: remainingVip,
						},
						settings: settings,
						siteInfo: {
							name: settings.site_name,
							description: settings.site_description,
						},
					});
				});
			});
		}
	});
};

/**
 * @desc Handle Event Booking
 * Process ticket booking form submission
 */
exports.postEventBooking = (req, res, next) => {
	const eventId = req.params.id;
	const { attendee_name, general_tickets, vip_tickets, notes } = req.body;

	// Get site settings first to check requirements
	const settingsQuery =
		"SELECT require_booking_notes FROM site_settings ORDER BY id DESC LIMIT 1";

	global.db.get(settingsQuery, (err, settings) => {
		if (err) {
			next(err);
			return;
		}

		// Validate input
		const generalTickets = parseInt(general_tickets) || 0;
		const vipTickets = parseInt(vip_tickets) || 0;

		if (!attendee_name || attendee_name.trim() === "") {
			return res.status(400).render("attendee/event.ejs", {
				title: "Booking Error",
				error: "Please enter your name.",
				event: req.body,
			});
		}

		if (generalTickets <= 0 && vipTickets <= 0) {
			return res.status(400).render("attendee/event.ejs", {
				title: "Booking Error",
				error: "Please select at least one ticket.",
				event: req.body,
			});
		}

		// Check if booking notes are required
		if (
			settings &&
			settings.require_booking_notes &&
			(!notes || notes.trim() === "")
		) {
			return res.status(400).render("attendee/event.ejs", {
				title: "Booking Error",
				error:
					"Please provide booking notes - they are required for this event.",
				event: req.body,
			});
		}

		// Check event exists and is published
		const eventQuery = `SELECT * FROM events WHERE event_id = ? AND status = 'published'`;

		global.db.get(eventQuery, [eventId], (err, event) => {
			if (err) {
				next(err);
			} else if (!event) {
				return res.status(404).render("error", {
					message: "Event Not Found",
					error: "This event is not available for booking.",
				});
			} else {
				// Check ticket availability
				const availabilityQuery = `SELECT 
                                        SUM(CASE WHEN ticket_type = 'general' THEN quantity ELSE 0 END) as general_booked,
                                        SUM(CASE WHEN ticket_type = 'vip' THEN quantity ELSE 0 END) as vip_booked
                                       FROM bookings WHERE eventId = ?`;

				global.db.get(availabilityQuery, [eventId], (err, originalBookings) => {
					if (err) {
						next(err);
					} else {
						const generalBooked = originalBookings.general_booked || 0;
						const vipBooked = originalBookings.vip_booked || 0;

						const remainingGeneral = event.tickets_general - generalBooked;
						const remainingVip = event.tickets_vip - vipBooked;

						// Check if requested tickets are available
						if (
							generalTickets > remainingGeneral ||
							vipTickets > remainingVip
						) {
							return res.status(400).render("attendee/event.ejs", {
								title: `${event.title} - Event Details`,
								event: event,
								remainingTickets: {
									general: Math.max(0, remainingGeneral),
									vip: Math.max(0, remainingVip),
								},
								error:
									"Not enough tickets available. Please select fewer tickets.",
								siteInfo: {
									name: "EventFlow Manager",
									description:
										"Professional event management for all your needs",
								},
							});
						}

						// Create bookings
						const bookedAt = new Date().toISOString();
						const bookings = [];

						if (generalTickets > 0) {
							bookings.push({
								eventId: eventId,
								attendee_name: attendee_name.trim(),
								ticket_type: "general",
								quantity: generalTickets,
								notes: notes || "",
								bookedAt: bookedAt,
							});
						}

						if (vipTickets > 0) {
							bookings.push({
								eventId: eventId,
								attendee_name: attendee_name.trim(),
								ticket_type: "vip",
								quantity: vipTickets,
								notes: notes || "",
								bookedAt: bookedAt,
							});
						}

						// Insert bookings
						const insertQuery = `INSERT INTO bookings (eventId, attendee_name, ticket_type, quantity, notes, bookedAt)
                                        VALUES (?, ?, ?, ?, ?, ?)`;

						let completedBookings = 0;
						const totalBookings = bookings.length;

						bookings.forEach((booking) => {
							global.db.run(
								insertQuery,
								[
									booking.eventId,
									booking.attendee_name,
									booking.ticket_type,
									booking.quantity,
									booking.notes,
									booking.bookedAt,
								],
								function (err) {
									if (err) {
										next(err);
									} else {
										completedBookings++;

										if (completedBookings === totalBookings) {
											// All bookings completed successfully
											res.render("attendee/booking-success.ejs", {
												title: "Booking Confirmed",
												event: event,
												booking: {
													attendee_name: attendee_name,
													general_tickets: generalTickets,
													vip_tickets: vipTickets,
													notes: notes,
													bookedAt: bookedAt,
												},
												siteInfo: {
													name: "EventFlow Manager",
													description:
														"Professional event management for all your needs",
												},
											});
										}
									}
								}
							);
						});
					}
				});
			}
		});
	});
};
