// Login module

const express = require('express')
const router = express.Router()

const passport = require('passport'); // Add this line to require passport
const { checkNotAuthenticated} = require('../authMiddleware')

// const bcrypt = require('bcrypt');
const userData = require('../userData'); // Adjust the path as necessary


router.get("/", checkNotAuthenticated, (req, res) => {
    res.render("login")
})


// // from vid
// router.post('/', checkNotAuthenticated, passport.authenticate('local', {
//     successRedirect: '/', // go to home page
//     failureRedirect: '/login', // go to back to login
//     failureFlash: true,
// }))

  
router.post('/', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', (error, user, info) => {
        if (error) { 
            return next(error) 
        }
        if (!user) { 
            // Use flash messages to display any authentication errors
            req.flash('error', info.message)
            return res.redirect('/login') 
        }
        req.logIn(user, (error) => {
            if (error) { return next(error) }

            // Check if profile is complete, redirect accordingly
            if (user.profileComplete) {
                console.log("Logged in user:", user);
                console.log("User profile completion status:", user.profileComplete);
                console.log("Redirecting to home.");
                return res.redirect('/') // Redirect to home/dashboard if profile is complete
            } else {
                console.log("Redirecting to complete profile.");
                return res.redirect('/complete-profile') // Redirect to profile completion page
            }
        })
    })(req, res, next)
})


module.exports = router