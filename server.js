// *** Read README.md file for updates and explanations for files*** 
// Server file

// Check if the application is running in production environment. If not, load environment variables from a .env file.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config() // load all environment variables
}

const express = require('express') // require express library
const app = express() // create an instance of express application
const port = 4000; // port number for server

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Importing the necessary modules for the application
const bcrypt = require('bcrypt') // for hashing passwords and comparing hashed passwords
const flash  = require('express-flash')
const session  = require('express-session')
const userData = require('./userData');
const { checkAuthenticated } = require('./authMiddleware')
const { checkNotAuthenticated } = require('./authMiddleware')
const methodOverride = require('method-override')

const passport = require('passport')
const initializePassport = require('./passport-config')

// Initialize the passport module with strategies for user authentication
initializePassport(
    passport,
    username => userData.findUserByUsername(username),
    id => userData.findUserById(id)
    ) // function for finding user based on username


app.set('view engine', 'ejs') // Sets EJS as the template engine for rendering views

// Serve static files from the `css` and `views` directories
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true})) // code to access body coming from forms
app.use(flash()) // Use flash middleware for displaying flash messages stored in session

// Use session middleware for handling sessions.
app.use(session({
    secret: process.env.SESSION_SECRET, // name of secret key
    resave: false, // essentially is asking if we should resave our session variables if nothing has changed 
    saveUninitialized: false // do you want to save an empty value in the session if there is no value.
}))

// Initialize passport and session for handling login sessions
app.use(passport.initialize())
app.use(passport.session())

// Use methodOverride middleware to support HTTP verbs such as PUT or DELETE in places where the client doesn't support it. This is used in the logout forms.
app.use(methodOverride('_method')) 

// storing in local variable instead of db currently
// const users = []


// old version for logging out
// app.delete('/logout', (req, res) => {
//     req.logOut()
//     res.redirect('/login')
// })

// use this since new passport version requires callback function
app.delete('/logout', (req, res) => {
    req.logout(function(error) {
        if (error) { 
            return next(error) 
        }
        res.redirect('/login')
    })
    // res.redirect('/login')
})


// route for '/' URl which will render the 'home' view
// Checks if user is authenticated before rendering
app.get('/', checkAuthenticated, (req, res) => {
    res.render("home")
})

const fuelQuoteRoutes = require('./routes/fuelQuoteRoutes') // import fuel quote routes from the specified file
app.use('/quote', fuelQuoteRoutes); // use fuelQuoteRoutes module for routes starting with '/'

const userRouter = require('./routes/users') // import user related routes
app.use('/users', userRouter) // use userRouter module for routes starting with '/users'

const loginRouter = require('./routes/login') // Login page
app.use('/login', loginRouter)

const registerRouter = require('./routes/register') // Registration page
app.use('/register', registerRouter)

const profileRouter = require('./routes/profile') // Client profile page
app.use('/profile', profileRouter)

const completeprofileRouter = require('./routes/complete-profile') // Client profile page
app.use('/complete-profile', completeprofileRouter)

// Not used since replaced by fuelQuoteRoutes
// const quoteRouter = require('./routes/quote') // Fuel Quote form page
// app.use('/quote', quoteRouter)

const historyRouter = require('./routes/history'); // Fuel quote history page
app.use('/history', historyRouter)



// Include login module, client profile management module, fuel quote module, pricing module

// makes server actually run with port number
const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });


module.exports = server;