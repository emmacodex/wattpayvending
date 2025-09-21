import { useState, useEffect } from 'react'
import { supabase, transactions } from '../lib/supabase'
import toast from 'react-hot-toast'

export const useTransactions = (userId) => {
  const [transactionsList, setTransactionsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTransactions = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await transactions.getByUser(userId)
      
      if (error) {
        setError(error.message)
        toast.error('Failed to fetch transactions')
        return
      }

      setTransactionsList(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transactionData) => {
    try {
      setLoading(true)
      setError(null)

      // Import token validator
      const { tokenValidator } = await import('../lib/tokenValidator.js')
      
      // Generate a realistic token
      const token = tokenValidator.generateToken()
      
      const newTransaction = {
        ...transactionData,
        user_id: userId,
        token,
        status: 'pending', // Start as pending
        created_at: new Date().toISOString()
      }

      // Create transaction in database
      const { data, error } = await transactions.create(newTransaction)
      
      if (error) {
        setError(error.message)
        toast.error('Failed to create transaction')
        return { success: false, error }
      }

      // Simulate payment processing
      const paymentResult = await processPayment(transactionData.amount, transactionData.payment_method)
      
      if (paymentResult.success) {
        // Update transaction status to success
        const { data: updatedTransaction, error: updateError } = await supabase
          .from('transactions')
          .update({ 
            status: 'success',
            payment_reference: paymentResult.reference,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)
          .select()
          .single()

        if (updateError) {
          console.error('Failed to update transaction status:', updateError)
        }

        // Send notification
        const { notifications } = await import('../lib/notifications.js')
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          await notifications.sendTransactionNotification(user.data.user, updatedTransaction || data)
        }

        // Add to local state
        setTransactionsList(prev => [updatedTransaction || data, ...prev])
        toast.success('Transaction completed successfully!')
        return { success: true, data: updatedTransaction || data }
      } else {
        // Update transaction status to failed
        await supabase
          .from('transactions')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id)

        toast.error('Payment failed: ' + paymentResult.error)
        return { success: false, error: paymentResult.error }
      }
    } catch (err) {
      setError(err.message)
      toast.error('An unexpected error occurred')
      return { success: false, error: err }
    } finally {
      setLoading(false)
    }
  }

  // Simulate payment processing
  const processPayment = async (amount, paymentMethod) => {
    // Simulate different payment methods
    switch (paymentMethod) {
      case 'Card Payment':
        return { success: true, reference: `CARD_${Date.now()}` }
      case 'Bank Transfer':
        return { success: true, reference: `BANK_${Date.now()}` }
      case 'USSD':
        return { success: true, reference: `USSD_${Date.now()}` }
      case 'Wallet':
        return { success: true, reference: `WALLET_${Date.now()}` }
      default:
        return { success: false, error: 'Invalid payment method' }
    }
  }

  const searchTransactions = async (searchTerm) => {
    if (!userId || !searchTerm) {
      fetchTransactions()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const { data, error } = await transactions.search(userId, searchTerm)
      
      if (error) {
        setError(error.message)
        toast.error('Failed to search transactions')
        return
      }

      setTransactionsList(data || [])
    } catch (err) {
      setError(err.message)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const generateToken = () => {
    // Generate a random 16-digit token in format: XXXX-XXXX-XXXX-XXXX
    const generateRandomDigits = (length) => {
      return Math.random().toString().substr(2, length).padEnd(length, '0')
    }
    
    return `${generateRandomDigits(4)}-${generateRandomDigits(4)}-${generateRandomDigits(4)}-${generateRandomDigits(4)}`
  }

  useEffect(() => {
    fetchTransactions()
  }, [userId])

  return {
    transactions: transactionsList,
    loading,
    error,
    createTransaction,
    searchTransactions,
    refetch: fetchTransactions
  }
}
