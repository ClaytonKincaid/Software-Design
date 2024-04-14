const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");
const {initializePassport, authenticateUser} = require('./passport-config')
const userData = require('./userData'); 

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

// jest.mock('passport', () => {
//     return {
//         use: jest.fn(),
//         serializeUser: jest.fn(),
//         deserializeUser: jest.fn()
//     };
// });

jest.mock('passport', () => ({
    use: jest.fn(),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn()
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
        
        await authenticateUser('test_user', 'wpassword', done);

        expect(userData.findUserByUsername).toHaveBeenCalled();
        expect(done).toHaveBeenCalledWith(null, false, { message: 'No user with that username' });
    });

});


describe('initialize tests', () => {

    test('should initialize passport', () => {

        initializePassport(passport);

        expect(passport.use).toHaveBeenCalled();
        expect(passport.serializeUser).toHaveBeenCalled();
        expect(passport.deserializeUser).toHaveBeenCalled();
   
    });

    test('should call done with user if user is found', async () => {
        // Mock userData.findUserById to resolve with a dummy user
        const mockUser = {
            id: 1,
            username: 'test_user',
            password: 'password',
            profileComplete: true
        };
        userData.findUserById.mockResolvedValue(mockUser);
        const done = jest.fn();

        initializePassport(passport);
        const response = await passport.deserializeUser(1, done);
        
        expect(response).toBe((null, {"id": 1, "password": "password", "profileComplete": true, "username": "test_user"}));
        // expect(done).toHaveBeenCalledWith(null, mockUser);
    });

    // test('should call done with user if user is found', async () => {
    //     // Mock userData.findUserById to resolve with a dummy user
    //     const mockUser = {
    //         id: 1,
    //         username: 'test_user',
    //         password: 'password',
    //         profileComplete: true
    //     };
    //     userData.findUserById.mockResolvedValue(mockUser);

    //     const done = jest.fn();

    //     initializePassport(passport);

    //     // await passport.deserializeUser(123, done);

    //     expect(passport.use).toHaveBeenCalled();
    //     expect(passport.serializeUser).toHaveBeenCalled();
    //     expect(passport.deserializeUser).toHaveBeenCalled();
    //     expect(done).toHaveBeenCalledWith(null, mockUser);
    // });

});
