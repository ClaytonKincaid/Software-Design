// Method for calculating the price of fuel
class PricingModule {
    constructor() {
        // initialization here
    }

    calculatePrice(quoteDetails) {
        const basePrice = 1.50
        const {quantity} = quoteDetails
        const totalPrice = quantity * basePrice
        return totalPrice
    }

}

module.exports = PricingModule