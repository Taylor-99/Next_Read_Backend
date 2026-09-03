// A middleware that will get the token and userId from the cookie and add it in the request body.

// A function that will find the token from the cookie, and the userID from the token
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {

    const { token } = req.cookies;

    // Check if token is available
    if(!token){
        return res.json({ success: false, message: 'Not Authorized. Login Again' });
    };

    try{

        //decode the token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        // Find the userID
        if(tokenDecode.id){
            
            req.userId = tokenDecode.id

        } else {
            // If token decode ID is not available
            return res.json({ success: false, message: 'Not Authorized, Login Again' })
        };

        // Call the controller function or try to execute controller function
        next();


    }catch (error) {

        return res.json({ success: false, message: error.message });

    }

};

module.exports = userAuth;