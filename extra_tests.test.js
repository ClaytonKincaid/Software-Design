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
  test('should return 200', async () => {
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

// profile.js tests

describe('GET /profile', () => {
  test('should return 200 when retrieving profile page while authenticated with a complete profile', async () => {
    const mockProfileData = {
      fullName: "Full Name",
      address1: "Address 1",
      address2: "Address 2",
      city: "City",
      state: "TX",
      zipcode: "12345"
    }
    userData.getProfileDataById.mockResolvedValue(mockProfileData);

    const response = await request(app).get('/profile');

    expect(userData.getProfileDataById).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
  });

  test('should return 404 when retrieving profile page while a user that can not be found', async () => {
    userData.getProfileDataById.mockResolvedValue(null);

    const response = await request(app).get('/profile');

    expect(userData.getProfileDataById).toHaveBeenCalled();
    expect(response.statusCode).toBe(404);
  });
});

describe('POST /profile', () => {
    test('should return 302 when sent valid profile data', async () => {
      const mockProfileData = {
        fullName: "Full Name",
        address1: "Address 1",
        address2: "Address 2",
        city: "City",
        state: "TX",
        zipcode: "12345"
      }

      userData.setUserProfileComplete.mockResolvedValue(null);

      const response = await request(app)
          .post('/profile')
          .send(mockProfileData)

      expect(userData.setUserProfileComplete).toHaveBeenCalled();
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe('/profile');
  });

  test('should return 500 when sent invalid profile data', async () => {
    const mockProfileData = {
      // No data sent
    }

    userData.setUserProfileComplete.mockRejectedValue(new Error('Some error message'));

    const response = await request(app)
        .post('/profile')
        .send(mockProfileData)

    expect(userData.setUserProfileComplete).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });
});





//***********************************************************************************
//  completeProfile.js tests

describe('GET /complete-profile', () => {
  test('should return 200 when authenticated with an incomplete profile', async () => {
    userData.findUserById.mockResolvedValue({ id: '123', username: 'test_user', profileComplete: false });

    const response = await request(app).get('/complete-profile');
    
    expect(userData.findUserById).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
  });

  test('should redirect to home if user found with a completed profile', async () => {
    userData.findUserById.mockResolvedValue({ id: '123', username: 'test_user', profileComplete: true });

    const response = await request(app).get('/complete-profile');

    expect(userData.findUserById).toHaveBeenCalled();
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/');

  });
});


describe('POST /complete-profile', () => {
  test('should redirect to home when sent valid profile data', async () => {
    const mockProfileData = {
      fullName: "Full Name",
      address1: "Address 1",
      address2: "Address 2",
      city: "City",
      state: "TX",
      zipcode: "12345"
    }

    userData.setUserProfileComplete.mockResolvedValue(null);

    const response = await request(app)
        .post('/complete-profile')
        .send(mockProfileData)

    expect(userData.setUserProfileComplete).toHaveBeenCalled();
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/');
  });

  test('should return 500 when sent invalid profile data', async () => {
    const mockProfileData = {
      // No data sent
    }

    userData.setUserProfileComplete.mockRejectedValue(new Error('Some error message'));

    const response = await request(app)
        .post('/complete-profile')
        .send(mockProfileData)

    expect(userData.setUserProfileComplete).toHaveBeenCalled();
    expect(response.statusCode).toBe(500);
  });
});



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
