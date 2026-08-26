/* Require modules */
require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const morgan = require('morgan');

//initialize/create the express app
const app = express();

/* Configure the app to refresh the browser when nodemon restarts */
const liveReloadServer = livereload.createServer();

liveReloadServer.server.once("connection", () => {
    // wait for nodemon to fully restart before refreshing the page
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

/* Middleware (app.use) */

// Indicates where our static files are located
app.use(cors());
app.use(express.static('public'));
// Use the connect-livereload package to connect nodemon and livereload
app.use(connectLiveReload());
// Body parser: used for POST/PUT/PATCH routes: 
// this will take incoming strings from the body that are URL encoded and parse them 
// into an object that can be accessed in the request parameter as a property called body (req.body).
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('tiny')) // morgan is just a logger

// process.env will look at the environment for environment variables
const PORT = process.env.PORT || 5000;

// app.listen lets our app know which port to run
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});