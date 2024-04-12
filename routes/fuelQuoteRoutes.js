// Route definitions related to fuel quote functionality
const express = require('express')
const router = express.Router()
const { checkAuthenticated, checkProfileComplete, validateQuoteFields } = require('../authMiddleware')
const userData = require('../userData')

const PricingModule = require('../PricingModule')
// const { route } = require('./routes/users')

const pricingModule = new PricingModule()

// Route to display the fuel quote form
router.get('/', checkAuthenticated, checkProfileComplete, (req, res) => {
    res.render('fuelQuoteForm', {
        gallonsRequested: '',
        deliveryDate: '',
        suggestedPrice: '',
        totalAmountDue: ''
    })
})

// Route to handle the form submission
router.post('/', checkAuthenticated, checkProfileComplete, validateQuoteFields, async (req, res) => {
    try {
        const { gallonsRequested, deliveryDate } = req.body;

        const profileData = await userData.getProfileDataById(req.user.id);

        const quoteDetails = {
            userId: req.user.id,
            gallonsRequested: parseFloat(gallonsRequested),
            deliveryAddress: profileData.address1,
            deliveryDate: deliveryDate
        };

        // Calculate the price
        const suggestedPricePerGallon = pricingModule.calculatePrice(quoteDetails);
        const totalAmountDue = suggestedPricePerGallon * quoteDetails.gallonsRequested;

        quoteDetails.suggestedPrice = suggestedPricePerGallon;
        quoteDetails.totalAmountDue = totalAmountDue;

        // Re-render the form with calculated values
        res.render('fuelQuoteForm', {
            gallonsRequested,
            deliveryDate,
            suggestedPrice: suggestedPricePerGallon.toFixed(2), // 2 decimal places
            totalAmountDue: totalAmountDue.toFixed(2) // 2 decimal places
        });
    } catch (error) {
        console.error('Error calculating fuel quote:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to handle the confirmation of the quote
router.post('/confirm-quote', checkAuthenticated, checkProfileComplete, async (req, res) => {
    try {
        const { gallonsRequested, deliveryDate, suggestedPrice, totalAmountDue } = req.body;
        
        const profileData = await userData.getProfileDataById(req.user.id);

        const quoteDetails = {
            userId: req.user.id,
            gallonsRequested: parseFloat(gallonsRequested),
            deliveryAddress: profileData.address1,
            deliveryDate: deliveryDate,
            suggestedPrice: suggestedPrice,
            totalAmountDue: totalAmountDue
        };

        // Store the fuel quote in the database
        await userData.storeFuelQuote(quoteDetails);

        console.log('Quote confirmed:', req.body);
        

        // Render a confirmation view or redirect the user to a confirmation page
        res.render('quoteConfirmation', {
            gallonsRequested,
            deliveryDate,
            suggestedPrice,
            totalAmountDue
        })
    } catch (error) {
        console.error('Error storing fuel quote data:', error);
        res.status(500).send('Internal Server Error');
    }
})


module.exports = router
