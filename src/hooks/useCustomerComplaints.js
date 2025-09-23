import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import toast from 'react-hot-toast'

export const useCustomerComplaints = (userId) => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Submit a new complaint
  const submitComplaint = useCallback(async (complaintData) => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const newComplaint = {
        user_id: userId,
        complaint_type: complaintData.complaint_type,
        subject: complaintData.subject,
        description: complaintData.description,
        transaction_id: complaintData.transaction_id || null,
        status: 'open',
        priority: 'medium'
      }

      const { data, error } = await supabase
        .from('customer_complaints')
        .insert([newComplaint])
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setComplaints(prev => [data, ...prev])
      
      toast.success('Complaint submitted successfully! We\'ll get back to you soon.')
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to submit complaint. Please try again.')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Fetch user's complaints
  const fetchUserComplaints = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('customer_complaints')
        .select(`
          *,
          transactions:transaction_id (
            disco_name,
            amount,
            token
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      setComplaints(data || [])
      return { success: true, data: data || [] }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch complaints')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initialize complaints fetch
  useEffect(() => {
    if (userId) {
      fetchUserComplaints()
    }
  }, [userId, fetchUserComplaints])

  return {
    complaints,
    loading,
    error,
    submitComplaint,
    fetchUserComplaints
  }
}
