const request = require("supertest");
const express = require('express');
const app = require("./server");
const bcrypt = require("bcrypt");
const passport = require('passport');

const initialize = require('./passport-config');
const LocalStrategy = require('passport-local').Strategy;
const userData = require('./userData');

//***********************************************************************************
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


// Mock passport.authenticate
passport.authenticate = jest.fn();

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
          callback(null, { id: 123, username: 'test_user', profileComplete: true }, null);
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




jest.mock('./authMiddleware', () => ({
  checkAuthenticated: jest.fn((req, res, next) => {
    next();
  }),
  checkNotAuthenticated: jest.fn((req, res, next) => {
    next();
  }),
  checkProfileComplete: jest.fn((req, res, next) => {
    next();
  }),
  validateRegistration: jest.fn((req, res, next) => {
    next();
  }),
  validateProfileInfo: jest.fn((req, res, next) => {
    next();
  }),
  validateQuoteFields: jest.fn((req, res, next) => {
    next();
  })
}));


// npx jest extra_tests.test.js
// fuelQuoteRoutes.js 

// Mock passport.authenticate
passport.authenticate = jest.fn();

// Test for GET request
describe('GET /quote', () => {
  test('should display the initial quote form page', async () => {
    const response = await request(app).get('/quote');
    expect(response.statusCode).toBe(200);
  });
});

// Test for POST request
describe('POST /quote', () => {
  test('should rerender the page with the fuel quote calcuations', async () => {
    jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          // Simulate a valid initial form submission
          callback(null, { id: 1, username: 'test_user', profileComplete: true }, null);
        };
    });

    const response = await request(app)
      .post('/quote')
      .send({ gallonsRequested: 3, deliveryDate: '2024-05-23' });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/quote');
  });

  test('should redirect to complete profile page if profile is not complete', async () => {
    passport.authenticate.mockImplementation((strategy, callback) => () => {
      const user = { id: 1, username: 'test_user', profileComplete: false };
      return callback(null, user);
    });

    const response = await request(app)
      .post('/quote')
      .send({ gallonsRequested: 3, deliveryDate: '2024-05-23' });

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

    const response = await request(app).post('/quote').send({ gallonsRequested: '3', deliveryDate: '2024-05-23' });
    expect(response.statusCode).toBe(500); // Internal server error
  });
});


describe('POST /quote/confirm-quote', () => {
  test('should render quote confirmation page', async () => {
    jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
        return (req, res, next) => {
          // Simulate a valid initial form submission
          callback(null, { id: 1, username: 'test_user', profileComplete: true }, null);
        };
    });

    const response = await request(app)
      .post('/quote/confirm-quote')
      .send({ gallonsRequested: 3, deliveryDate: '2024-05-23', suggestedPrice: 10.00, totalAmountDue: 30.00 });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/quote/confirm-quote');
  });

  test('should redirect to complete profile page if profile is not complete', async () => {
    passport.authenticate.mockImplementation((strategy, callback) => () => {
      const user = { id: 1, username: 'test_user', profileComplete: false };
      return callback(null, user);
    });

    const response = await request(app)
      .post('/quote/confirm-quote')
      .send({ gallonsRequested: 3, deliveryDate: '2024-05-23' });

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

    const response = await request(app).post('/quote').send({ gallonsRequested: '3', deliveryDate: '2024-05-23' });
    expect(response.statusCode).toBe(500); // Internal server error
  });
});




// PricingModule.js

const PricingModule = require('./PricingModule');

describe('PricingModule', () => {
    describe('calculatePrice', () => {
        it('should correctly calculate the total price based on gallons requested', () => {

            const pricingModule = new PricingModule();
            const quoteDetails = { gallonsRequested: 3 };

            const totalPrice = pricingModule.calculatePrice(quoteDetails);

            expect(totalPrice).toBe(4.50); // 3 gallons * $1.50 (base price) = $4.50, pricing module isn't fully setup at the moment, this test will need to be changed later
        });
    });
});