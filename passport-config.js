const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const userData = require('./userData');

function initialize(passport, getUserByUsername, getUserById) {
    const authenticateUser = async (username, password, done) => { // call done whenever we are done authenticating the user
        const user = await userData.findUserByUsername(username)
        if (user == null) {
            return done(null, false, {message: 'No user with that username'})
        }
        
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: 'Password incorrect'})
            }
            

        } catch (error) {
            return done(error)
        }

    }

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



module.exports = initialize