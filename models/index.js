require('dotenv').config()
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect(process.env.CONNECTION_URL);
const db = mongoose.connection

db.on('connected', function () {
    console.log(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`);
});