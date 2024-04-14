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

router.get("/", checkAuthenticated, checkProfileComplete, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch profile data for the current user
        const profileData = await userData.getProfileDataById(userId);

        if (profileData) {
            // Render the clientProfile view and pass the profileData to prefill the form
            res.render("clientProfile", { userProfile: profileData, stateCodes: stateCodes });
        } else {
            res.status(404).send('Profile data not found');
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to handle updating the profile via POST request
router.post("/", checkAuthenticated, checkProfileComplete, validateProfileInfo, async (req, res) => {
    try {
        const { fullName, address1, address2, city, state, zipcode } = req.body
        const userId = req.user.id;

        // Update profile
        await userData.setUserProfileComplete(userId, { fullName, address1, address2, city, state, zipcode })

        console.log('Profile updated for:', req.user.username)
        console.log('Full Name:', fullName)
        console.log('Address 1:', address1)
        console.log('Address 2:', address2)
        console.log('City:', city)
        console.log('State:', state)
        console.log('Zipcode:', zipcode)
        console.log()

        res.redirect('/profile'); // Redirect to home or dashboard after profile completion
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).send('Error completing profile');
    }
});

// Export the router to be mounted in the main application file
module.exports = router