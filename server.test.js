const request = require("supertest");
const app = require("./server");


jest.mock('./authMiddleware', () => ({
  checkAuthenticated: (req, res, next) => {
    next();
  },
  checkNotAuthenticated: (req, res, next) => {
    next(); 
  },
  checkProfileComplete: (req, res, next) => {
    next(); 
  }
}));


// Login tests
describe('GET /login', () => {
  it('should render the login view if not authenticated', async () => {
      const res = await request(app).get('/login');
      expect(res.status).toEqual(200);
  });
}); 

// npx jest server.test.js