/* Require modules */
require('dotenv').config()
const express = require('express');
const cors = require('cors');
const livereload = require("livereload");
const connectLiveReload = require("connect-livereload");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes.js');
const userRouter = require('./routes/userRoutes.js');

// process.env will look at the environment for environment variables
const PORT = process.env.PORT || 5500;

/* Require the db connection, models, and seed data
--------------------------------------------------------------- */
const database = require('./config/index.js');

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

// Add our frontend link
const allowOrigins = ['http://localhost:5173']

/* Middleware (app.use) */
app.use(express.json()); //All the requests will be passed using json
app.use(cookieParser());
// credentials true so that we can send the cookies in the response from the express app.
app.use(cors({ origin: allowOrigins, credentials: true }));  

// API Endpoint
app.get('/', (req, res) => res.send("API Working"));
app.use('/auth', authRouter);
app.use('/user', userRouter);

app.use(express.static('public')); // Use the connect-livereload package to connect nodemon and livereload
app.use(connectLiveReload());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny')) // morgan is just a logger

// app.listen lets our app know which port to run
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});