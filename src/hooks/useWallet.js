import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import toast from 'react-hot-toast'

export const useWallet = (userId) => {
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])

  // Get wallet balance
  const getBalance = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      // For demo purposes, we'll simulate a wallet balance
      // In a real app, this would fetch from the database
      const demoBalance = Math.floor(Math.random() * 50000) + 10000 // Random balance between ₦10,000 - ₦60,000
      setBalance(demoBalance)
      
      return { success: true, balance: demoBalance }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Add funds to wallet
  const addFunds = useCallback(async (amount, paymentMethod) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      console.log(`💰 Adding ₦${amount} to wallet via ${paymentMethod}`)
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate payment success (90% success rate)
      const paymentSuccess = Math.random() > 0.1
      
      if (paymentSuccess) {
        const newBalance = balance + amount
        setBalance(newBalance)
        
        // Add transaction to history
        const transaction = {
          id: Date.now().toString(),
          type: 'credit',
          amount: amount,
          paymentMethod: paymentMethod,
          status: 'success',
          timestamp: new Date().toISOString(),
          reference: `TXN${Date.now()}`
        }
        
        setTransactions(prev => [transaction, ...prev])
        
        toast.success(`Successfully added ₦${amount.toLocaleString()} to your wallet!`)
        return { success: true, newBalance, transaction }
      } else {
        toast.error('Payment failed. Please try again.')
        return { success: false, error: 'Payment failed' }
      }
    } catch (err) {
      setError(err.message)
      toast.error('An error occurred while adding funds')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId, balance])

  // Deduct funds from wallet
  const deductFunds = useCallback(async (amount, description = 'Payment') => {
    if (!userId) return

    try {
      if (balance < amount) {
        toast.error('Insufficient wallet balance')
        return { success: false, error: 'Insufficient balance' }
      }

      const newBalance = balance - amount
      setBalance(newBalance)
      
      // Add transaction to history
      const transaction = {
        id: Date.now().toString(),
        type: 'debit',
        amount: amount,
        description: description,
        status: 'success',
        timestamp: new Date().toISOString(),
        reference: `TXN${Date.now()}`
      }
      
      setTransactions(prev => [transaction, ...prev])
      
      return { success: true, newBalance, transaction }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [userId, balance])

  // Get wallet transactions
  const getTransactions = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      // For demo purposes, generate some sample transactions
      const sampleTransactions = [
        {
          id: '1',
          type: 'credit',
          amount: 25000,
          paymentMethod: 'Bank Transfer',
          status: 'success',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          reference: 'TXN123456789'
        },
        {
          id: '2',
          type: 'debit',
          amount: 5000,
          description: 'Electricity Purchase',
          status: 'success',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          reference: 'TXN123456788'
        },
        {
          id: '3',
          type: 'credit',
          amount: 15000,
          paymentMethod: 'Card Payment',
          status: 'success',
          timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          reference: 'TXN123456787'
        }
      ]
      
      setTransactions(sampleTransactions)
      return { success: true, transactions: sampleTransactions }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initialize wallet when userId changes
  useEffect(() => {
    if (userId) {
      getBalance()
      getTransactions()
    }
  }, [userId, getBalance, getTransactions])

  return {
    // Data
    balance,
    transactions,
    
    // State
    loading,
    error,
    
    // Actions
    getBalance,
    addFunds,
    deductFunds,
    getTransactions
  }
}
