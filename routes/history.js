// Fuel Quote History module
const express = require('express')
const router = express.Router()
const { checkAuthenticated, checkProfileComplete } = require('../authMiddleware')
const userData = require('../userData')



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