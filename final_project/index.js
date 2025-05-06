const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    if(req.session.authorization) { // Check if session and authorization exist
        let token = req.session.authorization['accessToken']; // Access Token from session

        jwt.verify(token, "fingerprint_customer", (err,user)=>{ // Verify with correct secret
            if(!err){
                req.user = user; // Store user details for subsequent use if needed
                next();
            } else{
                return res.status(403).json({message: "User not authenticated, token verification failed"});
            }
         });
     } else {
         return res.status(403).json({message: "User not logged in"});
     }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
