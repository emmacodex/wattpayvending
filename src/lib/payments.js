import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe (you'll need to add your Stripe publishable key to .env)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export const payments = {
  // Process payment with Stripe
  processPayment: async (amount, currency = 'NGN') => {
    try {
      const stripe = await stripePromise
      
      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to kobo (smallest currency unit)
          currency: currency.toLowerCase(),
        }),
      })

      const { clientSecret } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name',
          },
        },
      })

      if (error) {
        throw new Error(error.message)
      }

      return { success: true, paymentIntent }
    } catch (error) {
      console.error('Payment failed:', error)
      return { success: false, error: error.message }
    }
  },

  // Process USSD payment (simulate)
  processUSSD: async (amount, phoneNumber) => {
    try {
      // Simulate USSD payment processing
      const ussdCode = `*723*${amount}#`
      
      // In a real app, you'd integrate with a USSD provider like Paystack, Flutterwave, etc.
      const response = await fetch('/api/process-ussd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          phoneNumber,
          ussdCode,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('USSD payment failed:', error)
      return { success: false, error: error.message }
    }
  },

  // Process bank transfer
  processBankTransfer: async (amount, accountDetails) => {
    try {
      // Generate unique reference
      const reference = `PV${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
      
      const response = await fetch('/api/generate-bank-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          reference,
          accountDetails,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Bank transfer failed:', error)
      return { success: false, error: error.message }
    }
  }
}
