const request = require("supertest");
const express = require('express');
const app = require("./server");
const bcrypt = require("bcrypt");
const passport = require('passport');



// Mock authMiddleware
// Adjusted as needed for each unit test
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


// Register tests
describe('GET /register', () => {
  it('should render the register view', async () => {
      const res = await request(app).get('/register');
      expect(res.status).toEqual(200);
  });
}); 

// Mock hashing
jest.mock("bcrypt", () => ({
  hash: jest.fn((password, salt) => Promise.resolve("hashedPassword"))
}));


const userData = require("./userData");
jest.mock("./userData");

describe('POST /register', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  it('should register a new user and redirect to login on success', async () => {
    const res = await request(app)
      .post('/register')
      .send({username: 'testUser', password: 'password' });

    expect(userData.addUser).toHaveBeenCalledWith({
      id: expect.any(String),
      username: "testUser",
      password: "hashedPassword"
    });
    expect(bcrypt.hash).toHaveBeenCalledWith("password", 10);
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/login'); // Check if redirected to login
  });

  it('should not register new user when another user with the same username exists', async () => {
    userData.findUserByUsername.mockReturnValue(true); // Mocking that user already exists
    const res = await request(app)
      .post('/register')
      .send({username: 'testUser', password: 'password' });

    expect(userData.addUser).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/register'); // Check if still on register page
  });

  it('should not register new user when another user with the same username exists', async () => {
    userData.findUserByUsername.mockReturnValue(true); // Mocking that user already exists
    const res = await request(app)
      .post('/register')
      .send({username: 'testUser', password: 'password' });

    expect(userData.addUser).not.toHaveBeenCalled();
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(res.statusCode).toEqual(302);
    expect(res.headers.location).toEqual('/register'); // Check if still on register page
  });
});


// Mock passport.authenticate
passport.authenticate = jest.fn();

// Login tests
describe('GET /login', () => {
  it('should render the login view', async () => {
      const res = await request(app).get('/login');
      expect(res.status).toEqual(200);
  });
});

describe('POST /login', () => {
  beforeEach(() => {
      jest.clearAllMocks(); // Clear mocks before each test
  });

    it('should redirect to /login if authentication fails', async () => {
      // Mock the passport.authenticate function to simulate failed authentication
      jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
        callback(null, null, { message: 'Invalid credentials' });
      });
  
      const res = await request(app)
        .post('/login')
        .send({ username: 'invalid_username', password: 'invalid_password' });
  
      expect(res.status).toEqual(302);
      expect(res.header.location).toEqual('/login'); // Ensure it redirects to /login
    });

    it('should redirect to /complete-profile if profile is incomplete after successful authentication', async () => {
      jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
        callback(null, { id: '123', username: 'test_user', profileComplete: false });
      });

      const res = await request(app)
        .post('/login')
        .send({ username: 'valid_username', password: 'valid_password' });
    
      expect(res.status).toEqual(302);
      expect(res.header.location).toEqual('/complete-profile');
    });

    it('should redirect to home if profile is incomplete after successful authentication', async () => {
      jest.spyOn(passport, 'authenticate').mockImplementation((strategy, callback) => {
        callback(null, { id: '123', username: 'test_user', profileComplete: true });
      });
        const res = await request(app)
          .post('/login')
          .send({ username: 'valid_username', password: 'valid_password' });
      
        expect(res.status).toEqual(302);
        expect(res.header.location).toEqual('/');
      });
});


// Profile tests
describe('GET /profile', () => {
  it('should return 200 if user is found', async () => {
    userData.findUserById.mockReturnValue({ id: '123', profileComplete: false });
    const res = await request(app)
      .get('/profile')
    expect(res.status).toEqual(200);
  });

  it('should return 404 if user is not found', async () => {
    userData.findUserById.mockReturnValue(undefined); // user does not exist
    const res = await request(app)
      .get('/profile')
    expect(res.status).toEqual(404);
  });
});

// Mock userData setUserProfileComplete function
userData.setUserProfileComplete = jest.fn();

describe('POST /profile', () => {
  it('should update user profile and redirect to /profile', async () => {
    // Mock request body
    const profileData = {
      fullName: 'John Doe',
      address1: '123 Main St',
      address2: 'Apt 101',
      city: 'Anytown',
      state: 'NY',
      zipcode: '12345'
    };

    userData.findUserById.mockReturnValue({ id: '123', profileComplete: false });

    const res = await request(app)
    .post('/profile')
    .send(profileData);

    expect(userData.setUserProfileComplete).toHaveBeenCalledWith('123', profileData);
    expect(res.status).toEqual(302); 
    expect(res.header.location).toEqual('/profile');
  });
});


// Complete profile
describe('GET /complete-profile', () => {
  it('should render the profile completion form if user is authenticated and profile is incomplete', async () => {
    // Mock userData to return an incomplete profile
    userData.findUserById.mockReturnValue({ id: '123', profileComplete: false });

    const res = await request(app)
      .get('/complete-profile')

    expect(res.status).toEqual(200);
  });

  it('should redirect to home if user is authenticated and profile is complete', async () => {
    // Mock userData to return a complete profile
    userData.findUserById.mockReturnValue({ id: '123', profileComplete: true });

    const res = await request(app)
      .get('/complete-profile')

    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual('/');
  });

  it('should redirect to /login if user is not authenticated', async () => {
    const res = await request(app).get('/complete-profile');

    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual('/login');
  });
});

describe('POST /complete-profile', () => {
  it('should update user profile and redirect to /profile', async () => {
    // Mock request body
    const profileData = {
      fullName: 'John Doe',
      address1: '123 Main St',
      address2: 'Apt 101',
      city: 'Anytown',
      state: 'NY',
      zipcode: '12345'
    };

    const authenticatedUserId = '123';

    userData.findUserById.mockReturnValue({ id: authenticatedUserId });

    const res = await request(app)
      .post('/complete-profile')
      .send(profileData)

    expect(userData.setUserProfileComplete).toHaveBeenCalledWith(authenticatedUserId, profileData);
    expect(res.status).toEqual(302);
    expect(res.header.location).toEqual('/profile');
  });
});


// History
describe('GET /history', () => {
  it('should render the history view', async () => {
      const res = await request(app).get('/history');
      expect(res.status).toEqual(200);
  });
});

// Quote
const PricingModule = require('./PricingModule'); 
jest.mock('./PricingModule', () => {
  return jest.fn().mockImplementation(() => ({
    calculatePrice: jest.fn().mockReturnValue(2.5) // Mock the calculatePrice method
  }));
});

describe('GET /quote', () => {
  it('should render the quote view', async () => {
      const res = await request(app).get('/quote');
      expect(res.status).toEqual(200);
  });
});

describe('POST /quote', () => {
  it('should calculate the price and render the fuel quote form with suggested price and total amount due', async () => {
    // Mock request body
    const requestBody = {
      gallonsRequested: '100',
      deliveryDate: '2024-04-01'
    };

    const res = await request(app)
      .post('/quote')
      .send(requestBody);

    expect(res.status).toEqual(200);

    // Check if correct prices shown
    expect(res.text).toContain('2.50');
    expect(res.text).toContain('250.00');
  });
});

describe('POST /quote/confirm-quote', () => {
  it('should log the confirmed quote and render the quote confirmation page with provided quote details', async () => {
    // Mock request body
    const requestBody = {
      gallonsRequested: '100',
      deliveryDate: '2024-04-01',
      suggestedPrice: '2.50',
      totalAmountDue: '250.00'
    };

    const res = await request(app)
      .post('/quote/confirm-quote')
      .send(requestBody);

    expect(res.status).toEqual(200);

    // Ensure quote details are displayed on the page
    expect(res.text).toContain('100'); 
    expect(res.text).toContain('2024-04-01');
    expect(res.text).toContain('2.50');
    expect(res.text).toContain('250.00');
  });
});
