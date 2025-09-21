import { useState, useEffect } from 'react'
import { smartMeter } from '../lib/smartMeter.js'
import { notifications } from '../lib/notifications.js'
import toast from 'react-hot-toast'

export const useSmartMeter = (meterNumber, discoCode) => {
  const [meterData, setMeterData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [consumptionHistory, setConsumptionHistory] = useState([])
  const [alerts, setAlerts] = useState([])

  // Fetch meter data
  const fetchMeterData = async () => {
    if (!meterNumber || !discoCode) return

    try {
      setLoading(true)
      setError(null)
      
      // For demo purposes, use simulated data
      const result = smartMeter.simulateMeterData(meterNumber)
      
      if (result.success) {
        setMeterData(result.data)
        
        // Check for low balance alerts
        if (result.data.status === 'low') {
          toast.error(`Low balance alert: ${result.data.currentBalance} units remaining`)
          await sendLowBalanceAlert(result.data)
        }
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch meter data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch consumption history
  const fetchConsumptionHistory = async (period = '30d') => {
    if (!meterNumber || !discoCode) return

    try {
      const result = await smartMeter.getConsumptionHistory(meterNumber, discoCode, period)
      
      if (result.success) {
        setConsumptionHistory(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch consumption history:', err)
    }
  }

  // Send low balance alert
  const sendLowBalanceAlert = async (meterData) => {
    try {
      const message = `PowerVend Alert: Your meter ${meterData.meterNumber} has low balance!
      
Current Balance: ${meterData.currentBalance} units
Estimated Days Remaining: ${meterData.daysRemaining} days
Daily Average: ${meterData.dailyAverage} units/day

Please top up to avoid power interruption.`

      // Get user data for notifications
      const { supabase } = await import('../lib/supabase.js')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Send SMS notification
        if (user.phone) {
          await notifications.sendSMS(user.phone, message)
        }
        
        // Send email notification
        if (user.email) {
          await notifications.sendEmail(
            user.email,
            'PowerVend - Low Balance Alert',
            message
          )
        }
      }
    } catch (error) {
      console.error('Failed to send low balance alert:', error)
    }
  }

  // Set up consumption alerts
  const setupAlerts = async (alertThresholds) => {
    try {
      const { supabase } = await import('../lib/supabase.js')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const result = await smartMeter.setupConsumptionAlerts(
          user.id,
          meterNumber,
          alertThresholds
        )
        
        if (result.success) {
          toast.success('Consumption alerts set up successfully')
          setAlerts(result.data)
        } else {
          toast.error('Failed to setup alerts: ' + result.error)
        }
      }
    } catch (error) {
      console.error('Failed to setup alerts:', error)
      toast.error('Failed to setup consumption alerts')
    }
  }

  // Get consumption analytics
  const getAnalytics = async () => {
    if (!meterNumber || !discoCode) return

    try {
      const result = await smartMeter.getConsumptionAnalytics(meterNumber, discoCode)
      return result
    } catch (error) {
      console.error('Failed to get analytics:', error)
      return { success: false, error: error.message }
    }
  }

  // Auto-refresh meter data every 5 minutes
  useEffect(() => {
    if (meterNumber && discoCode) {
      fetchMeterData()
      
      const interval = setInterval(() => {
        fetchMeterData()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [meterNumber, discoCode])

  return {
    meterData,
    loading,
    error,
    consumptionHistory,
    alerts,
    fetchMeterData,
    fetchConsumptionHistory,
    setupAlerts,
    getAnalytics,
    refetch: fetchMeterData
  }
}
