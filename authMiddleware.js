// Functions to check if user is authenticated or not.
// Essentially a middleware function
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next() // proceed if true
    }
    return res.redirect('/login')
}

// place this to restrict users to going to certain pages like if authenticated then cant go login
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}


// New middleware function to ensure profile completion
function checkProfileComplete(req, res, next) {
    if (req.isAuthenticated()) {
        // Assuming req.user contains the user object and profileComplete is a property
        if (!req.user.profileComplete) {
            // Redirect to complete-profile if the profile is not complete
            return res.redirect('/complete-profile')
        }
        return next()
    }
    // If not authenticated, redirect to login
    return res.redirect('/login')
}


// Validate user registration input
function validateRegistration(req, res, next) {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        req.flash('error', 'Username and password are required.');
        return res.redirect('/register');
    }

    next();
}


// Validate profile info

function validateProfileInfo(req, res, next) {
    const { fullName, address1, address2, city, state, zipcode } = req.body;

    // Validation rules
    const fullNameMaxLength = 50;
    const addressMaxLength = 100;
    const cityMaxLength = 100;
    const validStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];

    // Perform validation
    if (!fullName || fullName.length > fullNameMaxLength) {
        req.flash('error', 'Full Name is required and must be at most 50 characters.');
        return res.redirect('/profile');
    }

    if (!address1 || address1.length > addressMaxLength) {
        req.flash('error', 'Address 1 is required and must be at most 100 characters.');
        return res.redirect('/profile');
    }

    if (address2 && address2.length > addressMaxLength) {
        req.flash('error', 'Address 2 must be at most 100 characters.');
        return res.redirect('/profile');
    }

    if (!city || city.length > cityMaxLength) {
        req.flash('error', 'City is required and must be at most 100 characters.');
        return res.redirect('/profile');
    }

    if (!validStates.includes(state)) {
        req.flash('error', 'State is required.');
        return res.redirect('/profile');
    }

    if (!zipcode || zipcode.length < 5 || zipcode.length > 9) {
        req.flash('error', 'Zipcode is required and must be at least 5 characters.');
        return res.redirect('/profile');
    }

    next();
}


function validateQuoteFields(req, res, next) {
    const { gallonsRequested, deliveryDate } = req.body;

    if (!gallonsRequested || isNaN(parseFloat(gallonsRequested)) || parseFloat(gallonsRequested) <= 0) {
        req.flash('error', 'Gallons Requested must be a valid number greater than zero.');
        return res.redirect('/');
    }

    if (!deliveryDate) {
        req.flash('error', 'Delivery Date is required.');
        return res.redirect('/');
    }

    next();
}




// Export the additional middleware
module.exports = { checkAuthenticated, checkNotAuthenticated, checkProfileComplete, validateRegistration, validateProfileInfo, validateQuoteFields }