// Route definitions related to fuel quote functionality
const express = require('express')
const router = express.Router()
const { checkAuthenticated } = require('../authMiddleware')

const PricingModule = require('../PricingModule') // single dot represents current dir and two dots represents parent dir
// const { route } = require('./routes/users')

const pricingModule = new PricingModule()

// Route to display the fuel quote form
router.get('/', checkAuthenticated, (req, res) => {
    res.render('fuelQuoteForm', {
        gallonsRequested: '',
        deliveryDate: '',
        suggestedPrice: '',
        totalAmountDue: ''
    })
})

// Route to handle the form submission
router.post('/', checkAuthenticated, (req, res) => {
    const {gallonsRequested, deliveryDate} = req.body
    // Assumed
    const quoteDetails = {
        quantity: parseFloat(gallonsRequested)
    }

    // Calculate the price
    const suggestedPricePerGallon = pricingModule.calculatePrice(quoteDetails)
    const totalAmountDue = suggestedPricePerGallon * quoteDetails.quantity

    // Re render the form with calculated values
    res.render('fuelQuoteForm', {
        gallonsRequested,
        deliveryDate,
        suggestedPrice: suggestedPricePerGallon.toFixed(2), // 2 decimal places
        totalAmountDue: totalAmountDue.toFixed(2) // 2 decimal places
    })

})


// Route to handle the confirmation of the quote
router.post('/confirm-quote', checkAuthenticated, (req, res) => {
    const { gallonsRequested, deliveryDate, suggestedPrice, totalAmountDue } = req.body;

    // Here you would typically store the confirmed quote in a database
    // For now, you could log it to the console or render a confirmation message
    console.log('Quote confirmed:', req.body);

    // Render a confirmation view or redirect the user to a confirmation page
    res.render('quoteConfirmation', {
        gallonsRequested,
        deliveryDate,
        suggestedPrice,
        totalAmountDue
    })
    // Or redirect to a 'Thank you' or confirmation page
    // res.redirect('/thank-you');
})


module.exports = router