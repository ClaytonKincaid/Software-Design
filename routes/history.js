// Fuel Quote History module
const express = require('express')
const router = express.Router()
const { checkAuthenticated } = require('../authMiddleware')

router.get("/", checkAuthenticated, (req, res) => {
    res.render("fuelQuoteHistory")
})

module.exports = router