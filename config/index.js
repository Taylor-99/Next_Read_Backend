//In this file we will add the function that will connect us MongoDB database

require('dotenv').config(); // loads the .env file before runing this file
const mongoose = require('mongoose');

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI);

const database = mongoose.connection

database.on('connected', function () {
    console.log(`Database Connected! \nName ${database.name} at Host ${database.host}: \nPORT ${database.port}`);
});

module.exports = database;