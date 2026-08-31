//Where we will create the users model that will be stored in the database

import mongoose from 'mongoose'

// Create Schema to define the structure of our user data
const userSchema = new mongoose.Schema({
    name: {type: String, require: true}, 
    email : {type: String, require: true, unique: true}, //cannot create useres with the same email
    password : {type: String, require: true}, 
    verifyOtp : {type: String, default: ''}, // user verification or user verification OTP. 
    // Whenever a new user is created the verify OTP will be created and the default value will be empty
    verifyOtpExpireAt : {type: Number, default: 0}, //Adds the expire time of the verification OTP
    isAccountVerified : {type: Boolean, default: false}, //define whether the user is verified or not.
    resetOtp : {type: String, default: ''}, //Used to reset the password
    reserOtpExpireAt : {type: String, default: ''}, //Add the expire time or date for the reset OTP.
});

//Create user model
const userModel = mongoose.models.user || mongoose.model('user', userSchema); //searching if the user model is available

//export this user model from the file to use in other files to store the user data in mongoDB database
export default userModel;