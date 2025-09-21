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

      // Generate a random token (in real app, this would come from DISCO API)
      const token = generateToken()
      
      const newTransaction = {
        ...transactionData,
        user_id: userId,
        token,
        status: 'success', // In real app, this would be 'pending' initially
        created_at: new Date().toISOString()
      }

      const { data, error } = await transactions.create(newTransaction)
      
      if (error) {
        setError(error.message)
        toast.error('Failed to create transaction')
        return { success: false, error }
      }

      // Add to local state
      setTransactionsList(prev => [data, ...prev])
      toast.success('Transaction completed successfully!')
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      toast.error('An unexpected error occurred')
      return { success: false, error: err }
    } finally {
      setLoading(false)
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
