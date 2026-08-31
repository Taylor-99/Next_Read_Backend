// create different controller functions to create the API endpoint

const bcrypt = require('bcryptjs'); // to encrypt password
const jwt = require('jsonwebtoken'); // generate a token for authentication
const database = require('../models');

// User registration controller function
export const register = async (req, res) => {

    const {name, email, password} = req.body; //Get these details from the frontend response

    if(!name || !email || !password){ //checks if the name, email and the password is not available in the request

        //if any of this data is not available then it will return a response
        return res.json({success: false, message: 'Missing Details'}); // will create an object and the user is not created

    };

    //if the 3 variables are available, we have to store the data in a database
    try {

        // Check if the user already exists
        const existingUser = await database.User.findOne({email}); //find the user if they exist

        if(existingUser){

            //if the user exists return a response
            return res.json({ success: false, message: "User already exists" });

        };

        const hashedPassword = await bcrypt.hash(password, 10); //encrypts the password to store in the database

        // creates the user for the database
        const user = new database.User({ name, email, password: hashedPassword }); // creates user
        await user.save(); //saves the newly created user in the databese

        //Generate token for authentication using JWT
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });

        //send this token to users in the response
        res.cookie('token', token, {
            httpOnly: true, // only HTTP requests can access this cookie
            secure: process.env.NODE_ENV === 'production', // use environment variable to make it true(secure) for production environment or false(not secure) for development environment
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //need a dynamic value either strict or none. local environment we can write strict because frontend and backend is ran on local host. On a live server none because both fronend and backend are running on their own domain
            maxAge: 7 * 24 * 60 * 6 * 1000 //this cookie should expire. done in milliseconds (7days * 24hours * 60minutes * 60seconds * 1000milliseconds)
        });

        return res.json({success: true}); //user is successfully registered

    } catch (error) {

        //since user is not created and error message will show
        res.json({success: false, message: error.message});

    };
};

// User Login controller function
export const login = async (req, res) => {

    const {email, password} = req.body; //Get these details from the frontend response

    // validate the email and password
    if(!email || !password){

        return res.json({ success: false, message: 'Email and password are required' });

    };

    try{

        const user = await database.User.findOne({email}); //find the user if it is available

        // If the user is not available
        if(!user) {
            return res.json({ success: false, message: 'Invalid email' }); //User does not exist in this database
        };

        const isMatch = await bcrypt.compare( password, user.password); // will compare both passwords to see if they are a match

        //If the passwords are not matching
        if(!isMatch) {
            return res.json({ success: false, message: 'Invalid password'}); 
        };

        //User exist and the password is correct, generate a token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 6 * 1000 
        });

        return res.json({success: true}); //user is successfully logged in

    } catch (error) {
        // will return a response whenever any error occurs in the try block
        return res.json( {success: false, message: error.message });
    }

};

//User logout controller function
export const logout = async (req, res) => {

    try {

        //clear the cookie from the response 
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 6 * 1000 
        });

        return res.json({ success: true, message: "Logged Out"});

    } catch (error) {

        return res.json ({ success: false, message: error.message });

    }

};