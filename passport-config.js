const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const userData = require('./userData');


const authenticateUser = async (username, password, done) => { // call done whenever we are done authenticating the user
    const user = await userData.findUserByUsername(username) // function will return user by username
    // const user = findUserByUsername(username)
    if (user == null) { // check if we have a user
        return done(null, false, {message: 'No user with that username'})
    }
    // if we got here we know we have a user from user function
    try { // checking if the users password matches what was passed in the authenticateUser function
        if (await bcrypt.compare(password, user.password)) {
            return done(null, user) // have an authenticated user
        } else {
            return done(null, false, {message: 'Password incorrect'}) // users password did not match
        }
        
    } catch (error) {
        return done(error)
    }
}

function initializePassport(passport) {
    // passport.use(new LocalStrategy({usernameField: 'username', passwordField: 'password' }, authenticateUser))
    passport.use(new LocalStrategy({usernameField: 'username'}, authenticateUser))
    
    // passport.serializeUser((user, done) => {})
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await userData.findUserById(id);
            if (user) {
                done(null, user);
            } else {
                done(new Error('User not found'), null);
            }
        } catch (error) {
            done(error, null);
        }
    });

}



module.exports = {initializePassport, authenticateUser}