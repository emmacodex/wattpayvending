// Wallet system for PowerVend app
export const wallet = {
  // Get wallet balance
  getBalance: async (userId) => {
    try {
      const response = await fetch(`/api/wallet/balance/${userId}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to get wallet balance:', error)
      return { success: false, error: error.message }
    }
  },

  // Add funds to wallet
  addFunds: async (userId, amount, paymentMethod) => {
    try {
      const response = await fetch('/api/wallet/add-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          paymentMethod,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to add funds:', error)
      return { success: false, error: error.message }
    }
  },

  // Deduct funds from wallet
  deductFunds: async (userId, amount, transactionId) => {
    try {
      const response = await fetch('/api/wallet/deduct-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          transactionId,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to deduct funds:', error)
      return { success: false, error: error.message }
    }
  },

  // Get wallet transactions
  getTransactions: async (userId, limit = 10, offset = 0) => {
    try {
      const response = await fetch(`/api/wallet/transactions/${userId}?limit=${limit}&offset=${offset}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to get wallet transactions:', error)
      return { success: false, error: error.message }
    }
  },

  // Set up auto-topup
  setupAutoTopup: async (userId, amount, threshold) => {
    try {
      const response = await fetch('/api/wallet/auto-topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          threshold,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to setup auto-topup:', error)
      return { success: false, error: error.message }
    }
  }
}
