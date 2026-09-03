// create different controller functions to create the API endpoint

require('dotenv').config();
const bcrypt = require('bcryptjs'); // to encrypt password
const jwt = require('jsonwebtoken'); // generate a token for authentication
const userModel = require('../models/userModel.js');
const transporter = require('../config/nodemailer.js');

// User registration controller function
const register = async (req, res) => {

    const {name, email, password} = req.body; //Get these details from the frontend response

    if(!name || !email || !password){ //checks if the name, email and the password is not available in the request
        //if any of this data is not available then it will return a response
        return res.json({success: false, message: 'Missing Details'}); // will create an object and the user is not created
    };

    //if the 3 variables are available, we have to store the data in a database
    try {

        // Check if the user already exists
        const existingUser = await userModel.findOne({email}); //find the user if they exist

        if(existingUser){
            //if the user exists return a response
            return res.json({ success: false, message: "User already exists" });
        };

        const hashedPassword = await bcrypt.hash(password, 10); //encrypts the password to store in the database

        // creates the user for the database
        const user = new userModel({ name, email, password: hashedPassword }); // creates user
        await user.save(); //saves the newly created user in the database

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Next Read',
            text: `Welcome to Next Read website. Your account has been created with email id: ${email}`
        };

        await transporter.sendMail(mailOptions); // Will send the email

        //Generate token for authentication using JWT
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d' });

        //send this token to users in the response
        res.cookie('token', token, {
            httpOnly: true, // only HTTP requests can access this cookie
            secure: process.env.NODE_ENV === 'production', // use environment variable to make it true(secure) for production environment or false(not secure) for development environment
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', //need a dynamic value either strict or none. local environment we can write strict because frontend and backend is ran on local host. On a live server none because both fronend and backend are running on their own domain
            maxAge: 7 * 24 * 60 * 60 * 1000 //this cookie should expire. done in milliseconds (7days * 24hours * 60minutes * 60seconds * 1000milliseconds)
        });

        return res.json({success: true}); //user is successfully registered

    } catch (error) {
        //since user is not created and error message will show
        res.json({success: false, message: error.message});
    };
};

// User Login controller function
const login = async (req, res) => {

    const {email, password} = req.body; //Get these details from the frontend response

    // validate the email and password
    if(!email || !password){
        return res.json({ success: false, message: 'Email and password are required' });
    };

    try{

        const user = await userModel.findOne({email}); //find the user if it is available

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
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.json({success: true}); //user is successfully logged in

    } catch (error) {
        // will return a response whenever any error occurs in the try block
        return res.json( {success: false, message: error.message });
    }

};

// User logout controller function
const logout = async (req, res) => {

    try {

        //clear the cookie from the response 
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });

        return res.json({ success: true, message: "Logged Out"});

    } catch (error) {
        return res.json ({ success: false, message: error.message });
    }

};

// Send Verification OTP to the User's Email
const sendVerifyOTP = async (req, res) => {

    // Will send verification OTP on the email
    try {

        //get user id from the request
        const userId = req.userId;

        // Find the user from our database
        const user = await userModel.findById(userId);

        //Checks if account is verified
        if(user.isAccountVerified){
            //if true it means the user is already verified
            return res.json({ success: false, message: "Account Already verified" });
        };

        //If the account is not verified
        const otp = String( Math.floor( 100000 + Math.random()* 900000 ) )// Generate one 6 digit OTP that will be sent to the user email ID

        user.verifyOtp = otp;  //save OTP in the database for the user
        user.verifyOtpExpireAt = Date.now() + ( 24 * 60 * 60 * 1000 ); //set expiration for otp

        await user.save(); // Save the in the database
        
        // Send the OTP to user
        const mailOption =  {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Your OTP is ${otp}. Verify your account using this OTP`
        };

        // Send the email
        await transporter.sendMail(mailOption);

        res.json({ success: true, message: "Verification OTP Sent to Email"});

    } catch (error) {
        res.json({ success: false, message: error.message });
    }

};

// Get the OTP and verify User acoount
const verifyEmail = async (req, res) => {

    const { otp } = req.body;
    const userId = req.userId;

    //If userId or OTP is not availabel
    if(!userId || !otp) {
        return res.json({ success: false, message: "Missing Details" });
    };

    try {

        // Find the user
        const user = await userModel.findById(userId);

        // check if the user is available
        if(!user) {
            return res.json({ success: false, message: 'User not found' });
        };

        // Verify the OTP
        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json ({ success: false, message: 'Invalid OTP'});
        };

        // Check for the expire date
        if(user.verifyOtpExpireAt < Date.now()){

            return res.json({ success: false, message: 'OTP Expired' });
        };

        // OTP not expired, verify the Users account
        user.isAccountVerified = true;
        user.verifyOtp = '',
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Email verified successfully' });

    }catch ( error) {
        return res.json({ Success: false, message: error. message });
    }
};

// Check if the user is authenticated
const isAuthenticated = async (req, res) => {

    // Before this function runs, it will execute the middleware. After that this authentication controller will run
    try {
        return res.json({ success: true }); // If the user is already authenticated
    } catch (error) {
        res.json({ success: false, message: error.message });
    }

};

// Send Password Reset OTP
const sendResetOtp = async (req, res) => {

    const { email } = req.body;

    // Check if user exist
    if(!email){
        return res.json({ success: false, message: 'Email is required' });
    };

    try {

        const user = await userModel.findOne({ email });

        // Check if user is available
        if(!user){
            return res.json({ success: false, message: 'User not found' });
        };

        // Send reset OTP through email
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + (24 * 60 * 60 * 1000);

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to procees with resetting your password.`
        };

        await transporter.sendMail(mailOption);

        return res.json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

};

// Verify OTP and reset the password
const resetPassword = async (req, res) => {

    const { email, otp, newPassword } = req.body;

    if(!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP, and new password are required' });
    };

    try {

        const user = await userModel.findOne({email});
        if(!user){
            return res.json({ success: false, message: 'User not found' });
        };

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({ success: false, message: 'Invalid OTP' });
        };

        if(user.reserOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        };

        // Encrypt the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '',
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Password has been reset successfully' });

    } catch(error) {
        return res.json({ success: false, message: error.message});
    }

};

module.exports = {
    register,
    login,
    logout,
    sendVerifyOTP,
    verifyEmail,
    isAuthenticated,
    sendResetOtp,
    resetPassword
};
