// Method for calculating the price of fuel
class PricingModule {
    constructor() {
        // initialization here
    }

    // Previous version of calculatePrice method
    // calculatePrice(quoteDetails) {
    //     const basePrice = 1.50 // Price used for testing
    //     const {gallonsRequested} = quoteDetails
    //     const totalPrice = gallonsRequested * basePrice // Calculate gallons * price from Assignement 2
    //     return totalPrice
    // }

    calculatePrice(quoteDetails) {
        const basePrice = 1.50 // Price given from final assignment

        // 2% discount if in Texas, 4% if not        
        let locationFactor = 0.04 // Declare locationFactor variable
        if (quoteDetails.deliveryState === 'TX') {
            locationFactor = 0.02
        }

        // 1% discount if client has requested fuel before, 0% if not
        let rateHistoryFactor = 0.00
        // checks if fuelQuoteHistory is not empty. For example, if there is 11 entries in history will say 11 in length
        if (quoteDetails.fuelQuoteHistory.length > 0) {
            rateHistoryFactor = 0.01
        }
        
        // 2% discount if more than 1000 gallons, 3% if less
        let gallonsRequestedFactor = 0.03
        if (quoteDetails.gallonsRequested > 1000) {
            gallonsRequestedFactor = 0.02
        }

        const companyProfitFactor = 0.10 // always 10%


        const totalMargin = basePrice * (locationFactor - rateHistoryFactor + gallonsRequestedFactor + companyProfitFactor)

        const totalPrice = basePrice + totalMargin
        return totalPrice
    }



}

module.exports = PricingModule