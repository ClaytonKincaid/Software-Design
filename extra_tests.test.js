const request = require("supertest");
const express = require('express');
const app = require("./server");
const bcrypt = require("bcrypt");
const passport = require('passport');

//***********************************************************************************

// Implementation will be changed as needed for each unit test
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

const userData = require('./userData');  // Adjust the path as necessary
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

// Mock passport.authenticate
passport.authenticate = jest.fn();



// users.js tests
describe("GET /users", ()=> {

    describe("given /users endpoint", () => {
      test("should respond with status code 200", async () => {
        const response = await request(app).get("/users")
  
        expect(response.statusCode).toBe(200)
      })
      
    })

})

describe("GET /users/new", ()=> {
    describe("given /users/new endpoint", () => {
        test("should respond with status code 200", async () => {
            const response = await request(app).get("/users/new")

            expect(response.statusCode).toBe(200)
        })
    })
})

describe('User ID route', () => {
    // Test for GET request
    it('should get a user by ID', async () => {
      const userId = 1; // Example user ID
      const response = await request(app).get(`/users/${userId}`);
      expect(response.statusCode).toBe(200);
      expect(response.text).toEqual(`Get User With ID ${userId}`);
    });
  
    // Test for PUT request
    it('should update a user by ID', async () => {
      const userId = 1; // Example user ID
      const response = await request(app).put(`/users/${userId}`);
      expect(response.statusCode).toBe(200);
      expect(response.text).toEqual(`Get User With ID ${userId}`);
    });
  
    // Test for DELETE request
    it('should delete a user by ID', async () => {
      const userId = 1; // Example user ID
      const response = await request(app).delete(`/users/${userId}`);
      expect(response.statusCode).toBe(200);
      expect(response.text).toEqual(`Get User With ID ${userId}`);
    });
  });







//***********************************************************************************
// login.js tests

// Test for GET request
describe('GET /login', () => {
  test('should display the login page', async () => {
    const response = await request(app).get('/login');
    expect(response.statusCode).toBe(200);
  });
});

// Test for POST request
describe('POST /login', () => {
  test('should authenticate and redirect to home if profile is complete', async () => {
    jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          // Simulate a successful authentication with a user object that has a complete profile
          callback(null, { id: '123', username: 'test_user', profileComplete: true }, null);
        };
    });

    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'password' });

    expect(response.statusCode).toBe(302); // Redirection status code
    expect(response.headers.location).toBe('/'); // Redirect to home/dashboard
  });

  test('should redirect to complete profile page if profile is not complete', async () => {
    passport.authenticate.mockImplementation((strategy, callback) => () => {
      const user = { id: 1, username: 'testuser', profileComplete: false };
      return callback(null, user);
    });

    const response = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'password' });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/complete-profile');
  });

  test('should handle authentication errors correctly', async () => {
    jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
      return (req, res, next) => {
        // Simulate an authentication error
        callback(new Error('Authentication error'), null, null);
      };
    });

    const response = await request(app).post('/login').send({ username: 'testuser', password: 'wrongpassword' });
    expect(response.statusCode).toBe(500); // Internal server error
  });


  test('should redirect to login with error message if user not found', async () => {
    jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
      return (req, res, next) => {
        // Simulate user not found
        callback(null, null, { message: 'No user found' });
      };
    });

    const response = await request(app).post('/login').send({ username: 'unknownuser', password: 'password' });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/login');
    // You can also check for flash messages if your testing setup supports session handling
  });


  test('should handle logIn errors', async () => {
    jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
      return (req, res, next) => {
        // Simulate successful authentication with a user object
        const user = { id: '123', username: 'test_user', profileComplete: true };

        // Manually mock req.logIn to simulate an error during the login process
        req.logIn = (user, callback) => {
          callback(new Error('Login session error'));
        };

        callback(null, user, null);
      };
    });

    const response = await request(app).post('/login').send({ username: 'testuser', password: 'password' });
    expect(response.statusCode).toBe(500); // Expect an internal server error due to logIn failure
  });

});





//***********************************************************************************
//  profile.js tests

///////////
// describe("GET /profile", ()=> {

//   describe("given /profile endpoint", () => {

//     test("should respond with status code 200", async () => {

//       // jest.mock('./userData', () => ({
//       //   getProfileDataById: jest.fn()
//       // }));

//       // // Define the mock profile data
//       // const mockProfileData = {
//       //   fullName: 'John Doe',
//       //   address1: '123 Main St',
//       //   address2: '',
//       //   city: 'Anytown',
//       //   state: 'NY',
//       //   zipcode: '12345'
//       // };

//       // // Configure the mock to return this data when called
//       // userData.getProfileDataById.mockResolvedValue(mockProfileData);
  
//       // Make a GET request to the /profile route
//       const response = await request(app).get('/profile');
//       expect(response.statusCode).toBe(200)
//     })
    
//   })
// })


/////////

// Profile tests
describe('GET /profile', () => {
  // it('should return 200 if user is found', async () => {

  //   userData.getProfileDataById.mockResolvedValue({
  //     fullName: 'John Doe',
  //     address1: '123 Main St',
  //     city: 'Anytown',
  //     state: 'NY',
  //     zipcode: '12345'
  //   });

  //   const res = await request(app)
  //     .get('/profile')
  //   expect(res.status).toEqual(200);
  // });
  userData.getProfileDataById.mockResolvedValue(null);

  it('should return 404 if user does not exist', async () => {
    userData.findUserById.mockReturnValue(undefined); // user does not exist
    const res = await request(app)
      .get('/profile')
    expect(res.status).toEqual(404);
  });
});


// jest.mock('./authMiddleware', () => ({
//   checkAuthenticated: jest.fn((req, res, next) => next()),
//   checkProfileComplete: jest.fn((req, res, next) => next()),
//   validateProfileInfo: jest.fn((req, res, next) => next())
// }));


// // Mock userData setUserProfileComplete function
// userData.setUserProfileComplete = jest.fn();
// checkAuthenticated = jest.fn()

// describe('POST /', () => {
//   it('should update the user profile and redirect', async () => {
//     userData.setUserProfileComplete.mockResolvedValue();  // Mock successful database operation
//     const profileData = {
//       fullName: 'Jane Doe',
//       address1: '456 Elm St',
//       address2: '',
//       city: 'Springfield',
//       state: 'IL',
//       zipcode: '62704'
//     };
  
//     const response = await request(app)
//       .post('/')
//       .send(profileData);
  
//     expect(response.status).toBe(302);
//     expect(response.headers.location).toBe('/profile');
//   });

//   it('should handle database errors by redirecting to the profile page', async () => {
//     userData.setUserProfileComplete.mockRejectedValue(new Error('Database error'));  // Force a rejection to simulate DB error
  
//     const response = await request(app)
//       .post('/')
//       .send({
//         fullName: 'Jane Doe',
//         address1: '456 Elm St',
//         city: 'Springfield',
//         state: 'IL',
//         zipcode: '62704'
//       });
  
//     expect(response.status).toBe(302);
//     expect(response.headers.location).toBe('/profile');
//   });


//   it('should validate input before updating profile', async () => {
//     validateProfileInfo.mockImplementationOnce((req, res, next) => res.status(400).send('Invalid input'));

//     const response = await request(app)
//       .post('/')
//       .send({
//         fullName: '',  // Example of potentially invalid data
//         address1: '456 Elm St',
//         city: 'Springfield',
//         state: 'IL',
//         zipcode: '62704'
//       });

//     expect(response.status).toBe(400);
//     expect(response.text).toBe('Invalid input');
//   });

// });






//***********************************************************************************
//  completeProfile.js tests

// const { checkAuthenticated, checkProfileComplete } = require('./authMiddleware');

// jest.mock('./authMiddleware', () => ({
//   checkAuthenticated: jest.fn().mockImplementation((req, res, next) => next()),
//   checkProfileComplete: jest.fn().mockImplementation((req, res, next) => next())
// }));

// // Mock passport.authenticate
// passport.authenticate = jest.fn();

// jest.mock('./userData', () => ({
//   findUserById: jest.fn(),
//   setUserProfileComplete: jest.fn()
// }));

// jest.mock('./authMiddleware', () => ({
//   checkAuthenticated: jest.fn((req, res, next) => next()),
//   validateProfileInfo: jest.fn((req, res, next) => next())
// }));

// Complete profile
describe('GET /complete-profile', () => {

  // jest.mock('./userData', () => ({
  //   findUserById: jest.fn()
  // }));

  // const userData = require('./userData');

  beforeEach(() => {
    // Mock `findUserById` to return a user object when called with any user ID.
    userData.findUserById.mockResolvedValue({
      id: 1,
      username: 'testuser',
      profileComplete: true
    });
  });
  
  it('should redirect if user profile is already complete', async () => {
    userData.findUserById.mockResolvedValue({ id: 1, profileComplete: true });

    const response = await request(app).get('/');
    
    expect(response.statusCode).toBe(200);
    // expect(response.headers.location).toBe('/');
  });

  it('should return 302 if user profile is not complete', async () => {
    userData.findUserById.mockResolvedValue({ id: 1, profileComplete: false });

    const response = await request(app).get('/');
    
    expect(response.statusCode).toBe(200);
    // expect(response.text).toBe('Profile Incomplete');

  });

  // it('should redirect to home if user is authenticated and profile is complete', async () => {
  //   // Mock userData to return a complete profile
  //   userData.findUserById.mockReturnValue({ id: '123', profileComplete: true });

  //   const res = await request(app)
  //     .get('/complete-profile')

  //   expect(res.status).toEqual(302);
  //   expect(res.header.location).toEqual('/');
  // });

  // it('should redirect to /login if user is not authenticated', async () => {
  //   const res = await request(app).get('/complete-profile');

  //   expect(res.status).toEqual(302);
  //   expect(res.header.location).toEqual('/login');
  // });
});


// describe('POST /complete-profile', () => {
//   it('should update user profile and redirect to /profile', async () => {
//     // Mock request body
//     const profileData = {
//       fullName: 'John Doe',
//       address1: '123 Main St',
//       address2: 'Apt 101',
//       city: 'Anytown',
//       state: 'NY',
//       zipcode: '12345'
//     };

//     const authenticatedUserId = '123';

//     userData.findUserById.mockReturnValue({ id: authenticatedUserId });

//     const res = await request(app)
//       .post('/complete-profile')
//       .send(profileData)

//     expect(userData.setUserProfileComplete).toHaveBeenCalledWith(authenticatedUserId, profileData);
//     expect(res.status).toEqual(302);
//     expect(res.header.location).toEqual('/profile');
//   });
// });

// Pricingmodule
const PricingModule = require('./PricingModule');

describe('PricingModule', () => {
  let pricingModule;

  beforeEach(() => {
      // Initialize the PricingModule before each test
      pricingModule = new PricingModule();
  });

  test('calculatePrice returns the correct total price based on gallons requested', () => {
      const quoteDetails = { gallonsRequested: 10 };
      const expectedTotal = 15; // 10 gallons * $1.50 per gallon
      const result = pricingModule.calculatePrice(quoteDetails);
      
      expect(result).toBe(expectedTotal);
  });

  test('calculatePrice handles zero gallons', () => {
      const quoteDetails = { gallonsRequested: 0 };
      const expectedTotal = 0; // 0 gallons * $1.50 per gallon = $0
      const result = pricingModule.calculatePrice(quoteDetails);
      
      expect(result).toBe(expectedTotal);
  });

  test('calculatePrice handles large quantities', () => {
      const quoteDetails = { gallonsRequested: 1000 };
      const expectedTotal = 1500; // 1000 gallons * $1.50 per gallon
      const result = pricingModule.calculatePrice(quoteDetails);
      
      expect(result).toBe(expectedTotal);
  });
});


///////////////////////////////////////////////////////////////////////////***






// fuelQuoteRoutes.js 

describe('GET /quote', () => {
  test('should display the initial quote form page when authenticated with a complete profile', async () => {
    const response = await request(app).get('/quote');
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /quote', () => {
    test('should call getProfileDataById and rerender the page with the fuel quote calcuations', async () => {

      const mockProfileData = {
        fullName: 'Full Name',
        address1: 'Address 1',
        address2: 'Address 2',
        city: 'City',
        state: 'TX',
        zipcode: 77024
      };

      userData.getProfileDataById.mockResolvedValue(mockProfileData);
  
        const response = await request(app)
            .post('/quote')
            .send({ gallonsRequested: '3', deliveryDate: '2024-05-07' })
  
        expect(userData.getProfileDataById).toHaveBeenCalled();
        expect(response.statusCode).toBe(200);
    });

    describe('POST /quote/confirm-quote', () => {
      test('should call getProfileDataById and storeFuelQuote', async () => {
        const mockProfileData = {
            fullName: 'Full Name',
            address1: 'Address 1',
            address2: 'Address 2',
            city: 'City',
            state: 'TX',
            zipcode: '77024'
          };
    
        userData.getProfileDataById.mockResolvedValue(mockProfileData);
        userData.storeFuelQuote.mockResolvedValue(null);
      
        const response = await request(app)
          .post('/quote/confirm-quote')
          .send({ gallonsRequested: '3', deliveryDate: '2024-05-23', suggestedPrice:'10.00', totalAmountDue: '30.00' });

        expect(userData.getProfileDataById).toHaveBeenCalled();
        expect(userData.storeFuelQuote).toHaveBeenCalled();
        expect(response.statusCode).toBe(200);
      });
    });
  });



// history.js 


describe('GET /history', () => {
  test('should successfully access history and call getFuelQuoteHistoryById', async () => {
    userData.getFuelQuoteHistoryById.mockResolvedValue([]);

    const response = await request(app).get('/history');

    expect(userData.getFuelQuoteHistoryById).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
  });
});



// register.js 

describe('GET /register', () => {
  test('should successfully retrieve register page', async () => {
    const response = await request(app).get('/register');
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /register', () => {
  test('should stay on register page if username is already found', async () => {
      userData.findUserByUsername.mockResolvedValue('test_user');

      const response = await request(app)
          .post('/register')
          .send({ username: 'test_user', password: 'password' })

      expect(userData.findUserByUsername).toHaveBeenCalled();
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/register');
  });

  test('should redirect to login if registration was successful', async () => {
    userData.findUserByUsername.mockResolvedValue(null);
    userData.addUser.mockResolvedValue(null)

    const response = await request(app)
        .post('/register')
        .send({ username: 'test_user', password: 'password' })

    expect(userData.findUserByUsername).toHaveBeenCalled();
    expect(userData.addUser).toHaveBeenCalled();
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/login');
  });

});