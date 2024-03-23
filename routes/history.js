// Fuel Quote History module
const express = require('express')
const router = express.Router()
const { checkAuthenticated, checkProfileComplete } = require('../authMiddleware')

router.get("/", checkAuthenticated, checkProfileComplete, (req, res) => {
    res.render("fuelQuoteHistory")
})

module.exports = router