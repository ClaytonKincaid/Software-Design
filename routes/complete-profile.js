const express = require('express');
const router = express.Router();
const { checkAuthenticated, checkProfileComplete, validateProfileInfo } = require('../authMiddleware')
const userData = require('../userData')

// Example data store for the user profile
let userProfile = {
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipcode: ''
};

// Route to display the profile completion form
router.get("/", checkAuthenticated, (req, res) => {
    // Check if user's profile is already complete, redirect them accordingly
    const currentUser = userData.findUserById(req.user.id)
    if (currentUser && currentUser.profileComplete) {
        return res.redirect('/') // User's profile is already complete
    }
    res.render("completeProfile", { userProfile: currentUser })
})


router.post("/", checkAuthenticated, validateProfileInfo, (req, res) => {
    const { fullName, address1, address2, city, state, zipcode } = req.body
    const userId = req.user.id; // Assuming req.user.id is available and correctly populated

    // Update call to setUserProfileComplete to include profile details
    userData.setUserProfileComplete(userId, { fullName, address1, address2, city, state, zipcode })

    console.log('Profile completed:', req.user.username)
    // Log the completed profile details to the console
    console.log('Profile completed for:', req.user.username)
    console.log('Full Name:', fullName)
    console.log('Address 1:', address1)
    console.log('Address 2:', address2)
    console.log('City:', city)
    console.log('State:', state)
    console.log('Zipcode:', zipcode)
    console.log()
    
    res.redirect('/profile'); // Redirect to home or dashboard after profile completion
})

// Export the router to be mounted in the main application file
module.exports = router