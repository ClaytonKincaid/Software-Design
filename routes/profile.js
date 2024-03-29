const express = require('express');
const router = express.Router();
const { checkAuthenticated, checkProfileComplete, validateProfileInfo } = require('../authMiddleware')
const userData = require('../userData')

const stateCodes = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// Example data store for the user profile
let userProfile = {
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipcode: ''
};

router.get("/", checkAuthenticated, checkProfileComplete, (req, res) => {
    // Assuming req.user.id holds the authenticated user's ID
    const userId = req.user.id;

    // Find the current user based on their ID
    const currentUser = userData.findUserById(userId);

    if (currentUser) {
        // Render the clientProfile view and pass the currentUser data to prefill the form
        res.render("clientProfile", { userProfile: currentUser, stateCodes: stateCodes });
    } else {
        // Handle the case where no user is found (optional)
        res.status(404).send('User not found');
    }
});


// Route to handle updating the profile via POST request
router.post("/", checkAuthenticated, checkProfileComplete, validateProfileInfo, (req, res) => {
    const { fullName, address1, address2, city, state, zipcode } = req.body
    const userId = req.user.id; // Assuming req.user.id is available and correctly populated

    // Update call to setUserProfileComplete to include profile details
    userData.setUserProfileComplete(userId, { fullName, address1, address2, city, state, zipcode })

    // Log the completed profile details to the console
    console.log('Profile updated for:', req.user.username)
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