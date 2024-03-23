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

// Export the additional middleware
module.exports = { checkAuthenticated, checkNotAuthenticated, checkProfileComplete }