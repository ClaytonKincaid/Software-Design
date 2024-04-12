const passportConfig = require('./passport-config');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

jest.mock('passport', () => {
    return {
        use: jest.fn(),
        serializeUser: jest.fn(),
        deserializeUser: jest.fn()
    };
});

describe('passport configuration', () => {
    it('should use LocalStrategy with passport', () => {
        passportConfig(passport);

        expect(passport.use).toHaveBeenCalledWith(
            expect.any(LocalStrategy),
            expect.any(Function)
        );
    });

    it('should set up serializeUser and deserializeUser', () => {
        passportConfig(passport);

        expect(passport.serializeUser).toHaveBeenCalledWith(expect.any(Function));
        expect(passport.deserializeUser).toHaveBeenCalledWith(expect.any(Function));
    });
});
