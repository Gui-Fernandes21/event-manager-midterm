/**
* index.js
* This is the main app entry point
*/

// Set up express, bodyparser and EJS
const express = require('express');
const session = require("express-session");
var bodyParser = require("body-parser");

const mainRoutes = require("./routes/main");

// Import authentication middleware
const { loadUser, getSessionConfig } = require("./middlewares/auth");

const app = express();
const port = 3000;

// Set up express, bodyparser and EJS
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs'); // set the app to use ejs for rendering
app.use(express.static(__dirname + '/public')); // set location of static files

// Set up session middleware
app.use(session(getSessionConfig()));

// Set up SQLite
// Items in the global namespace are accessible throught out the node application
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db',function(err){
    if(err){
        console.error(err);
        process.exit(1);
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON"); 
    }
});

// Load user information for all requests
app.use(loadUser);

app.use('/', mainRoutes);

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