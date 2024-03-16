// Profile module

const express = require('express')
const router = express.Router()

router.get("/", (req, res) => {
    res.render("clientProfile")
})

router.post('/submit-form', (req, res) => {
    // Handle POST request for form submission.
});

router.put('/update-item/:id', (req, res) => {
    // Handle PUT request to update an item with the given ID.
});


module.exports = router