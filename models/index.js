//In this file we will add the function that will connect us MongoDB database

// import dotenv from 'dotenv';
import mongoose from 'mongoose'
import User from './userModel.js'

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection

db.on('connected', function () {
    console.log(`Database Connected! \nName ${db.name} at Host ${db.host}: \nPORT ${db.port}`);
});

export default {
    User
};