// Method for calculating the price of fuel
class PricingModule {
    constructor() {
        // initialization here
    }

    calculatePrice(quoteDetails) {
        const basePrice = 1.50 // Price used for testing
        const {gallonsRequested} = quoteDetails
        const totalPrice = gallonsRequested * basePrice // Calculate gallons * price from Assignement 2
        return totalPrice
    }

}

module.exports = PricingModule