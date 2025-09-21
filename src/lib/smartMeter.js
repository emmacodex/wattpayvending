// Smart Meter API integration for PowerVend
export const smartMeter = {
  // Check meter balance and consumption
  checkMeterStatus: async (meterNumber, discoCode) => {
    try {
      const response = await fetch('/api/smart-meter/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meterNumber,
          discoCode,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to check meter status:', error)
      return { success: false, error: error.message }
    }
  },

  // Get meter consumption history
  getConsumptionHistory: async (meterNumber, discoCode, period = '30d') => {
    try {
      const response = await fetch(`/api/smart-meter/consumption/${meterNumber}?disco=${discoCode}&period=${period}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to get consumption history:', error)
      return { success: false, error: error.message }
    }
  },

  // Get real-time consumption data
  getRealTimeConsumption: async (meterNumber, discoCode) => {
    try {
      const response = await fetch(`/api/smart-meter/realtime/${meterNumber}?disco=${discoCode}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to get real-time consumption:', error)
      return { success: false, error: error.message }
    }
  },

  // Calculate estimated days remaining
  calculateDaysRemaining: (currentBalance, dailyAverage) => {
    if (dailyAverage <= 0) return null
    return Math.floor(currentBalance / dailyAverage)
  },

  // Get consumption analytics
  getConsumptionAnalytics: async (meterNumber, discoCode) => {
    try {
      const response = await fetch(`/api/smart-meter/analytics/${meterNumber}?disco=${discoCode}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to get consumption analytics:', error)
      return { success: false, error: error.message }
    }
  },

  // Set up consumption alerts
  setupConsumptionAlerts: async (userId, meterNumber, alertThresholds) => {
    try {
      const response = await fetch('/api/smart-meter/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          meterNumber,
          alertThresholds,
        }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Failed to setup consumption alerts:', error)
      return { success: false, error: error.message }
    }
  },

  // Simulate meter data (for demo purposes)
  simulateMeterData: (meterNumber) => {
    // Generate realistic meter data
    const currentBalance = Math.random() * 1000 + 100 // 100-1100 units
    const dailyAverage = Math.random() * 20 + 5 // 5-25 units per day
    const daysRemaining = Math.floor(currentBalance / dailyAverage)
    
    return {
      success: true,
      data: {
        meterNumber,
        currentBalance: Math.round(currentBalance * 100) / 100,
        dailyAverage: Math.round(dailyAverage * 100) / 100,
        daysRemaining,
        lastUpdate: new Date().toISOString(),
        status: currentBalance < 50 ? 'low' : currentBalance < 100 ? 'medium' : 'good',
        consumption: {
          today: Math.round(Math.random() * 30 + 5),
          thisWeek: Math.round(Math.random() * 150 + 50),
          thisMonth: Math.round(Math.random() * 600 + 200),
        },
        trends: {
          daily: Math.random() > 0.5 ? 'increasing' : 'decreasing',
          weekly: Math.random() > 0.5 ? 'stable' : 'fluctuating',
        }
      }
    }
  }
}
