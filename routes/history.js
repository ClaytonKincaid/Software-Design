// Fuel Quote History module
const express = require('express')
const router = express.Router()
const { checkAuthenticated, checkProfileComplete } = require('../authMiddleware')
const userData = require('../userData')


// Example data
const historyData = [
    {
      "estimateDate": "2023-02-01T10:00:00.000Z",
      "gallonsRequested": 1200,
      "deliveryAddress": "5678 Main St, 90001, Los Angeles, CA",
      "deliveryDate": "2023-02-05T14:00:00.000Z",
      "suggestedPrice": 4.50,
      "quote": 2196.00
    },
    {
      "estimateDate": "2023-02-03T09:30:00.000Z",
      "gallonsRequested": 2000,
      "deliveryAddress": "4321 Elm St, 60601, Chicago, IL",
      "deliveryDate": "2023-02-08T12:00:00.000Z",
      "suggestedPrice": 4.50,
      "quote": 3660.00
    },
    {
      "estimateDate": "2023-02-04T16:15:00.000Z",
      "gallonsRequested": 1800,
      "deliveryAddress": "8765 Oak St, 33601, Tampa, FL",
      "deliveryDate": "2023-02-09T11:00:00.000Z",
      "suggestedPrice": 4.50,
      "quote": 3294.00
    },
    {
      "estimateDate": "2023-02-06T13:45:00.000Z",
      "gallonsRequested": 1500,
      "deliveryAddress": "9876 Maple Ave, 80201, Denver, CO",
      "deliveryDate": "2023-02-12T15:00:00.000Z",
      "suggestedPrice": 4.50,
      "quote": 2745.00
    },
    {
      "estimateDate": "2023-02-08T12:00:00.000Z",
      "gallonsRequested": 1000,
      "deliveryAddress": "2468 Pine St, 98101, Seattle, WA",
      "deliveryDate": "2023-02-14T08:00:00.000Z",
      "suggestedPrice": 4.50,
      "quote": 1830.00
    }
]


router.get("/", checkAuthenticated, checkProfileComplete, async (req, res) => {
  try {
      const userId = req.user.id;

      const historyData = await userData.getFuelQuoteHistoryById(userId);

      res.render("fuelQuoteHistory", { historyData });
  } catch (error) {
      console.error('Error retrieving fuel quote history data:', error);
      res.status(500).send('Internal Server Error');
  }
});

module.exports = router