// Register module

const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt') // for hashing passwords
const userData = require('../userData')
const { checkNotAuthenticated, validateRegistration} = require('../authMiddleware');


router.get("/", checkNotAuthenticated, (req, res) => {
    res.render("register")
})


// router.post('/', async (req, res) => {
//     try {
//         const hashedPassword = bcrypt.hash(req.body.password, 10) // 10 is how secure we want it to be - 10 is standard default value
//         users.push({
//             id: Date.now().toString(), // auto generated in database
//             username : req.body.username,
//             password : hashedPassword
//         })
//         res.redirect('/login') // redirect to login if successful
//     } catch {
//         res.redirect('/register') // if error happens redirect to register
//     }
//     console.log(users)
// })

router.post('/', checkNotAuthenticated, validateRegistration, async (req, res) => {
    try {
        // check if user already exists
        const user = await userData.findUserByUsername(req.body.username);

        if (user) {
            console.log(`Registration attempt failed: User ${req.body.username} already exists.`);
            req.flash('error', `Registration attempt failed: User ${req.body.username} already exists.`)
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is how secure we want it to be - 10 is standard default value
        
        // creates newUser object
        const newUser = {
            username: req.body.username,
            password: hashedPassword
        };

        await userData.addUser(newUser);

        console.log('New user registered:', newUser);

        res.redirect('/login'); // redirect to login if successful
    } catch (error) {
        console.error('Registration error:', error);
        res.redirect('/register'); // if error happens redirect to register
    }
});

module.exports = router