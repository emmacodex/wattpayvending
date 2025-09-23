// AI Model for Power Consumption Prediction
import { supabase } from './supabase.js'

class PowerConsumptionAI {
  constructor() {
    this.model = null
    this.isTrained = false
    this.predictionHistory = []
  }

  // Generate synthetic training data for demonstration
  generateTrainingData(userId, days = 90) {
    const data = []
    const baseDate = new Date()
    baseDate.setDate(baseDate.getDate() - days)

    // Simulate realistic consumption patterns
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + i)
      
      // Base consumption with seasonal and weekly patterns
      const dayOfWeek = date.getDay()
      const month = date.getMonth()
      
      // Weekend vs weekday pattern
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0
      
      // Seasonal pattern (higher in summer/winter)
      const seasonalMultiplier = month >= 5 && month <= 8 ? 1.4 : 
                                month >= 11 || month <= 1 ? 1.2 : 1.0
      
      // Random variation
      const randomVariation = 0.8 + Math.random() * 0.4
      
      // Base daily consumption
      const baseConsumption = 8.5
      const dailyConsumption = baseConsumption * weekendMultiplier * seasonalMultiplier * randomVariation
      
      data.push({
        date: date.toISOString().split('T')[0],
        consumption: Math.round(dailyConsumption * 100) / 100,
        dayOfWeek,
        month,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        temperature: 20 + Math.random() * 15, // Simulated temperature
        userId
      })
    }
    
    return data
  }

  // Train the AI model (simplified machine learning simulation)
  async trainModel(userId) {
    try {
      console.log('🤖 Training AI model for user:', userId)
      
      // Generate training data
      const trainingData = this.generateTrainingData(userId)
      
      // Simulate model training process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store training data in database (only if we have a valid meter_id)
      // For demo purposes, we'll skip database storage and just simulate success
      console.log('📊 Generated training data:', trainingData.length, 'records')
      
      // In a real implementation, you would:
      // 1. Get or create a smart meter record for the user
      // 2. Store the consumption records with the actual meter_id
      // For now, we'll simulate successful storage

      this.isTrained = true
      this.model = {
        userId,
        trainedAt: new Date().toISOString(),
        dataPoints: trainingData.length,
        accuracy: 0.87 // Simulated accuracy
      }

      console.log('✅ AI model trained successfully (background process)')
      return { success: true, model: this.model }
    } catch (error) {
      console.error('❌ Error training AI model:', error)
      return { success: false, error: error.message }
    }
  }

  // Predict future consumption
  async predictConsumption(userId, days = 7) {
    try {
      if (!this.isTrained) {
        await this.trainModel(userId)
      }

      console.log(`🔮 Predicting consumption for next ${days} days`)
      
      const predictions = []
      const today = new Date()
      
      for (let i = 1; i <= days; i++) {
        const futureDate = new Date(today)
        futureDate.setDate(today.getDate() + i)
        
        const dayOfWeek = futureDate.getDay()
        const month = futureDate.getMonth()
        
        // Apply same patterns as training data
        const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0
        const seasonalMultiplier = month >= 5 && month <= 8 ? 1.4 : 
                                  month >= 11 || month <= 1 ? 1.2 : 1.0
        
        // Add some prediction uncertainty
        const uncertainty = 0.9 + Math.random() * 0.2
        const baseConsumption = 8.5
        const predictedConsumption = baseConsumption * weekendMultiplier * seasonalMultiplier * uncertainty
        
        predictions.push({
          date: futureDate.toISOString().split('T')[0],
          predictedConsumption: Math.round(predictedConsumption * 100) / 100,
          confidence: Math.round((0.8 + Math.random() * 0.15) * 100) / 100,
          dayOfWeek,
          isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
          factors: {
            weekend: weekendMultiplier > 1,
            seasonal: seasonalMultiplier > 1,
            uncertainty: Math.round(uncertainty * 100) / 100
          }
        })
      }

      // Store predictions
      this.predictionHistory = predictions
      
      console.log('✅ Predictions generated successfully')
      return { success: true, predictions }
    } catch (error) {
      console.error('❌ Error generating predictions:', error)
      return { success: false, error: error.message }
    }
  }

  // Detect consumption anomalies
  async detectAnomalies(userId, recentDays = 7) {
    try {
      console.log('🔍 Detecting consumption anomalies')
      
      // Get recent consumption data
      const recentData = this.generateTrainingData(userId, recentDays)
      const recentConsumption = recentData.map(d => d.consumption)
      
      // Calculate statistics
      const mean = recentConsumption.reduce((a, b) => a + b, 0) / recentConsumption.length
      const variance = recentConsumption.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recentConsumption.length
      const stdDev = Math.sqrt(variance)
      
      // Detect anomalies (values more than 2 standard deviations from mean)
      const anomalies = recentData.filter(record => {
        const zScore = Math.abs(record.consumption - mean) / stdDev
        return zScore > 2
      }).map(record => ({
        date: record.date,
        consumption: record.consumption,
        expectedConsumption: mean,
        deviation: Math.round((record.consumption - mean) * 100) / 100,
        severity: Math.abs(record.consumption - mean) / stdDev > 3 ? 'high' : 'medium',
        type: record.consumption > mean ? 'high_consumption' : 'low_consumption'
      }))

      console.log(`✅ Found ${anomalies.length} anomalies`)
      return { success: true, anomalies, statistics: { mean, stdDev } }
    } catch (error) {
      console.error('❌ Error detecting anomalies:', error)
      return { success: false, error: error.message }
    }
  }

  // Generate smart recommendations
  async generateRecommendations(userId, currentBalance, consumptionHistory) {
    try {
      console.log('💡 Generating smart recommendations')
      
      const recommendations = []
      
      // Balance-based recommendations
      if (currentBalance < 50) {
        recommendations.push({
          type: 'urgent',
          category: 'purchase',
          title: 'Low Balance Alert',
          message: `Your balance is critically low (${currentBalance} units). Purchase more units immediately.`,
          action: 'Purchase Now',
          priority: 'high',
          estimatedSavings: null
        })
      } else if (currentBalance < 100) {
        recommendations.push({
          type: 'warning',
          category: 'purchase',
          title: 'Balance Running Low',
          message: `Your balance is getting low (${currentBalance} units). Consider purchasing more units soon.`,
          action: 'Plan Purchase',
          priority: 'medium',
          estimatedSavings: null
        })
      }

      // Consumption pattern recommendations
      const avgConsumption = consumptionHistory.reduce((a, b) => a + b, 0) / consumptionHistory.length
      if (avgConsumption > 12) {
        recommendations.push({
          type: 'efficiency',
          category: 'consumption',
          title: 'High Consumption Detected',
          message: `Your average consumption (${avgConsumption.toFixed(1)} units/day) is above normal. Consider energy-saving measures.`,
          action: 'View Tips',
          priority: 'medium',
          estimatedSavings: `Save up to ${(avgConsumption * 0.2).toFixed(1)} units/day`
        })
      }

      // Time-based recommendations
      const now = new Date()
      const hour = now.getHours()
      if (hour >= 18 && hour <= 22) {
        recommendations.push({
          type: 'timing',
          category: 'usage',
          title: 'Peak Hours Usage',
          message: 'You\'re using electricity during peak hours. Consider shifting some usage to off-peak times.',
          action: 'Optimize Schedule',
          priority: 'low',
          estimatedSavings: 'Save 10-15% on electricity costs'
        })
      }

      // Seasonal recommendations
      const month = now.getMonth()
      if (month >= 5 && month <= 8) {
        recommendations.push({
          type: 'seasonal',
          category: 'efficiency',
          title: 'Summer Energy Tips',
          message: 'Summer months typically see higher consumption. Use fans instead of AC when possible.',
          action: 'Learn More',
          priority: 'low',
          estimatedSavings: 'Save 20-30% on cooling costs'
        })
      }

      console.log(`✅ Generated ${recommendations.length} recommendations`)
      return { success: true, recommendations }
    } catch (error) {
      console.error('❌ Error generating recommendations:', error)
      return { success: false, error: error.message }
    }
  }

  // Get model performance metrics
  getModelMetrics() {
    return {
      isTrained: this.isTrained,
      accuracy: this.model?.accuracy || 0,
      dataPoints: this.model?.dataPoints || 0,
      lastTrained: this.model?.trainedAt || null,
      predictionsGenerated: this.predictionHistory.length
    }
  }

  // Reset model (for retraining)
  resetModel() {
    this.model = null
    this.isTrained = false
    this.predictionHistory = []
    console.log('🔄 AI model reset')
  }
}

// Export singleton instance
export const powerConsumptionAI = new PowerConsumptionAI()
export default powerConsumptionAI
