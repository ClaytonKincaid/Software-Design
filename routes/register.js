// Register module

const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt') // for hashing passwords
const userData = require('../userData') // grabs in memory database
const { checkNotAuthenticated } = require('../authMiddleware');


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

router.post('/', checkNotAuthenticated, async (req, res) => {
    try {
        // check if user already exists
        const user = userData.findUserByUsername(req.body.username)
        if (user) {
            // user already exists
            console.log(`Registration attempt failed: User ${req.body.username} already exists.`);
            req.flash('error', `Registration attempt failed: User ${req.body.username} already exists.`)
            return res.redirect('/register')
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10) // 10 is how secure we want it to be - 10 is standard default value
        
        // creates newUser object
        const newUser = {
            id: Date.now().toString(),
            username: req.body.username,
            password: hashedPassword,
        }

        userData.addUser(newUser) // adds newUser to our temp database
        
        // userData.addUser({
        //     id: Date.now().toString(),
        //     username: req.body.username,
        //     password: hashedPassword,
        // })

        // Log a message to the console confirming the registration
        console.log('New user registered:', newUser);

        res.redirect('/login') // redirect to login if successful
    } catch (error){
        console.error('Registration error:', error);
        res.redirect('/register') // if error happens redirect to register
    }
})

module.exports = router