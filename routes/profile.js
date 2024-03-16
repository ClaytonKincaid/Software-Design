const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../authMiddleware')

// Example data store for the user profile
let userProfile = {
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipcode: ''
};

// Route to display the client profile
router.get("/", checkAuthenticated, (req, res) => {
    // Render the clientProfile view and pass the current userProfile data to prefill the form
    res.render("clientProfile", { userProfile: userProfile });
});

// Route to handle updating the profile via POST request
router.post("/", checkAuthenticated, (req, res) => {
    // Update the userProfile with the form data
    userProfile = {
        fullName: req.body.fullName,
        address1: req.body.address1,
        address2: req.body.address2 || '', // Optional field
        city: req.body.city,
        state: req.body.state,
        zipcode: req.body.zipcode
    };
    
    // Log the updated profile to the console
    console.log('Updated user profile:', userProfile);
    
    // After updating the profile, you can redirect back to the profile page
    res.redirect('/profile'); // Redirect to the GET route to display the updated profile
});

// Export the router to be mounted in the main application file
module.exports = router;