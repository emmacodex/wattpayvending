import { useState, useEffect, useCallback } from 'react'
import { powerConsumptionAI } from '../lib/aiModel.js'
import toast from 'react-hot-toast'

export const useAIPredictions = (userId, meterData) => {
  const [predictions, setPredictions] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [modelMetrics, setModelMetrics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Initialize AI model
  const initializeModel = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🤖 Initializing AI model...')
      const result = await powerConsumptionAI.trainModel(userId)
      
      if (result.success) {
        setModelMetrics(powerConsumptionAI.getModelMetrics())
        // AI model training happens silently in the background
      } else {
        setError(result.error)
        // Only show error if training fails
        toast.error('Failed to train AI model')
      }
    } catch (err) {
      setError(err.message)
      toast.error('Error initializing AI model')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Generate predictions
  const generatePredictions = useCallback(async (days = 7) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      console.log(`🔮 Generating ${days}-day predictions...`)
      const result = await powerConsumptionAI.predictConsumption(userId, days)
      
      if (result.success) {
        setPredictions(result.predictions)
        // Predictions generated silently
      } else {
        setError(result.error)
        toast.error('Failed to generate predictions')
      }
    } catch (err) {
      setError(err.message)
      toast.error('Error generating predictions')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Detect anomalies
  const detectAnomalies = useCallback(async (days = 7) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Detecting consumption anomalies...')
      const result = await powerConsumptionAI.detectAnomalies(userId, days)
      
      if (result.success) {
        setAnomalies(result.anomalies)
        // Anomaly detection happens silently
      } else {
        setError(result.error)
        toast.error('Failed to detect anomalies')
      }
    } catch (err) {
      setError(err.message)
      toast.error('Error detecting anomalies')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Generate recommendations
  const generateRecommendations = useCallback(async () => {
    if (!userId || !meterData) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('💡 Generating smart recommendations...')
      
      // Simulate consumption history
      const consumptionHistory = [8.5, 9.2, 7.8, 10.1, 8.9, 9.5, 8.3]
      
      const result = await powerConsumptionAI.generateRecommendations(
        userId,
        meterData.currentBalance,
        consumptionHistory
      )
      
      if (result.success) {
        setRecommendations(result.recommendations)
        // Recommendations generated silently
      } else {
        setError(result.error)
        toast.error('Failed to generate recommendations')
      }
    } catch (err) {
      setError(err.message)
      toast.error('Error generating recommendations')
    } finally {
      setLoading(false)
    }
  }, [userId, meterData])

  // Auto-generate all AI insights
  const generateAllInsights = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('🚀 Generating all AI insights...')
      
      // Run all AI operations in parallel
      const [predictionsResult, anomaliesResult, recommendationsResult] = await Promise.all([
        powerConsumptionAI.predictConsumption(userId, 7),
        powerConsumptionAI.detectAnomalies(userId, 7),
        meterData ? powerConsumptionAI.generateRecommendations(
          userId,
          meterData.currentBalance,
          [8.5, 9.2, 7.8, 10.1, 8.9, 9.5, 8.3]
        ) : { success: true, recommendations: [] }
      ])

      if (predictionsResult.success) {
        setPredictions(predictionsResult.predictions)
      }
      
      if (anomaliesResult.success) {
        setAnomalies(anomaliesResult.anomalies)
      }
      
      if (recommendationsResult.success) {
        setRecommendations(recommendationsResult.recommendations)
      }

      // AI insights generated silently in the background
    } catch (err) {
      setError(err.message)
      toast.error('Error generating AI insights')
    } finally {
      setLoading(false)
    }
  }, [userId, meterData])

  // Reset all data
  const resetAI = useCallback(() => {
    setPredictions([])
    setAnomalies([])
    setRecommendations([])
    setModelMetrics(null)
    setError(null)
    powerConsumptionAI.resetModel()
    toast.success('AI model reset')
  }, [])

  // Initialize model when userId changes
  useEffect(() => {
    if (userId) {
      initializeModel()
    }
  }, [userId, initializeModel])

  // Auto-generate insights when meter data is available (only once)
  // Removed auto-generation to prevent infinite loops
  // Insights will be generated when user clicks "View Analytics"

  return {
    // Data
    predictions,
    anomalies,
    recommendations,
    modelMetrics,
    
    // State
    loading,
    error,
    
    // Actions
    generatePredictions,
    detectAnomalies,
    generateRecommendations,
    generateAllInsights,
    resetAI,
    initializeModel
  }
}
