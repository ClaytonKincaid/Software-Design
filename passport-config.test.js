const request = require("supertest");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const {initializePassport, authenticateUser} = require('./passport-config')
const userData = require('./userData'); 

jest.mock('./authMiddleware', () => ({
    checkAuthenticated: jest.fn((req, res, next) => {
      req.user = { id: 1, username: 'test_user', profileComplete: true };
      next();  // Simulates successful authentication
    }),
    checkNotAuthenticated: jest.fn((req, res, next) => {
      next();  // Simulates non-authenticated scenario for routes that require no auth
    }),
    checkProfileComplete: jest.fn((req, res, next) => {
      next();  // Simulates that the user profile is always complete
    }),
    validateRegistration: jest.fn((req, res, next) => {
      next();  // Placeholder if registration validation always passes
    }),
    validateProfileInfo: jest.fn((req, res, next) => {
      next();  // Placeholder if profile info validation always passes
    }),
    validateQuoteFields: jest.fn((req, res, next) => {
      next();  // Placeholder if quote fields validation always passes
    })
  }));



jest.mock('./userData', () => ({
  getUsers: jest.fn(),
  addUser: jest.fn(),
  findUserByUsername: jest.fn(),
  findUserById: jest.fn(),
  setUserProfileComplete: jest.fn(),
  getProfileDataById: jest.fn(),
  storeFuelQuote: jest.fn(),
  getFuelQuoteHistoryById: jest.fn()
}));


jest.mock('passport', () => ({
    use: jest.fn(),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn(),
    authenticate:jest.fn(),
    initialize: jest.fn(),
    session: jest.fn()
  }));

// Mock bcrypt compare function
jest.mock('bcrypt', () => ({
    compare: jest.fn()
  }));


describe('authenticateUser tests', () => {
    test('should authenticate user if username is found and passwords match', async () => {
        const mockUser = {
            id: 1,
            username: 'test_user',
            password: 'password',
            profileComplete: true
        };
        const done = jest.fn();
        bcrypt.compare.mockResolvedValue(true);
        userData.findUserByUsername.mockResolvedValue(mockUser);
        
        await authenticateUser('test_user', 'password', done);

        expect(userData.findUserByUsername).toHaveBeenCalled();
        expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    test('should return "Password incorrect" if username is found and passwords do not match', async () => {
        const mockUser = {
            id: 1,
            username: 'test_user',
            password: 'password',
            profileComplete: true
        };
        const done = jest.fn();
        bcrypt.compare.mockResolvedValue(false);
        userData.findUserByUsername.mockResolvedValue(mockUser);
        
        await authenticateUser('test_user', 'wrong_password', done);

        expect(userData.findUserByUsername).toHaveBeenCalled();
        expect(done).toHaveBeenCalledWith(null, false, { message: 'Password incorrect' });
    });

    test('should return "No user with that username" if username is not found', async () => {
        const done = jest.fn();
        userData.findUserByUsername.mockResolvedValue(null);
        
        await authenticateUser('test_user', 'password', done);

        expect(userData.findUserByUsername).toHaveBeenCalled();
        expect(done).toHaveBeenCalledWith(null, false, { message: 'No user with that username' });
    });

    test('should return an error when an error occurs', async () => {
        const mockUser = {
            id: 1,
            username: 'test_user',
            password: 'password',
            profileComplete: true
        };
        const done = jest.fn();
        userData.findUserByUsername.mockResolvedValue(mockUser);
        bcrypt.compare.mockRejectedValue(new Error('Error'));

        await authenticateUser('test_user', 'password', done);

        expect(done).toHaveBeenCalledWith(new Error('Error'));
    });

});



describe('initialize tests', () => {

    test('should initialize passport', () => {
        initializePassport(passport);

        expect(passport.use).toHaveBeenCalled();
        expect(passport.serializeUser).toHaveBeenCalled();
        expect(passport.deserializeUser).toHaveBeenCalled();
   
    });

});







