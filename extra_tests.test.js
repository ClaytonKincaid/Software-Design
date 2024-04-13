const request = require("supertest");
const express = require('express');
const app = require("./server");
const bcrypt = require("bcrypt");
const passport = require('passport');

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


