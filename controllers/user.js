exports.listUsers = (req, res, next) => {
	// Define the query to fetch all users
	const query = "SELECT * FROM users";

	// Execute the query and render the page with the results
	global.db.all(query, function (err, rows) {
		if (err) {
			next(err); //send the error on to the error handler
		} else {
			res.render("list-users.ejs", { users: rows }); // render page with users data
		}
	});
};

exports.addUserPost = (req, res, next) => {
	// Define the query to insert a new user
	const query = "INSERT INTO users (user_name) VALUES( ? );";
	const query_parameters = [req.body.user_name];

	// Execute the query and send a confirmation message
	global.db.run(query, query_parameters, function (err) {
		if (err) {
			next(err); //send the error on to the error handler
		} else {
			res.redirect("/users/list-users");
		}
	});
}