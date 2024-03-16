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

module.exports = { checkAuthenticated, checkNotAuthenticated };
