// Login module

const express = require('express')
const router = express.Router()

const passport = require('passport'); // Add this line to require passport
const { checkNotAuthenticated } = require('../authMiddleware')

// const bcrypt = require('bcrypt');
const userData = require('../userData'); // Adjust the path as necessary

router.get("/", checkNotAuthenticated, (req, res) => {
    res.render("login")
})

// router.post('/', async (req, res) => {
//     const user = userData.findUserByUsername(req.body.username);
//     if (user == null) {
//         return res.status(400).send('Cannot find user');
//     }
//     try {
//         if (await bcrypt.compare(req.body.password, user.password)) {
//             // Success login
//             res.redirect('/'); // Adjust to your successful login route
//         } else {
//             res.send('Not Allowed');
//         }
//     } catch {
//         res.status(500).send();
//     }
// });

// from vid
router.post('/', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/', // go to home page
    failureRedirect: '/login', // go to back to login
    failureFlash: true,
}))



module.exports = router