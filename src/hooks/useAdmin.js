import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import toast from 'react-hot-toast'

export const useAdmin = (userId) => {
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if user is admin
  const checkAdminStatus = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, permissions, is_active')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setIsAdmin(true)
        setAdminRole(data.role)
      } else {
        setIsAdmin(false)
        setAdminRole(null)
      }
    } catch (err) {
      setError(err.message)
      setIsAdmin(false)
      setAdminRole(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initialize admin check when userId changes
  useEffect(() => {
    if (userId) {
      checkAdminStatus()
    }
  }, [userId, checkAdminStatus])

  return {
    isAdmin,
    adminRole,
    loading,
    error,
    checkAdminStatus
  }
}

export const useAdminTransactions = (userId) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    successful: 0,
    failed: 0,
    totalAmount: 0
  })

  // Fetch all transactions for admin
  const fetchAllTransactions = useCallback(async (filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.disco_id) {
        query = query.eq('disco_id', filters.disco_id)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }
      if (filters.search) {
        query = query.or(`disco_name.ilike.%${filters.search}%,meter_number.ilike.%${filters.search}%,token.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      setTransactions(data || [])

      // Calculate stats
      const stats = {
        total: data?.length || 0,
        pending: data?.filter(t => t.status === 'pending').length || 0,
        successful: data?.filter(t => t.status === 'success').length || 0,
        failed: data?.filter(t => t.status === 'failed').length || 0,
        totalAmount: data?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0
      }
      setStats(stats)

      return { success: true, data, stats }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch transactions')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update transaction status
  const updateTransactionStatus = useCallback(async (transactionId, status, adminNotes = '') => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .select()
        .single()

      if (error) throw error

      // Log admin activity
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: userId,
          action: 'update_transaction_status',
          target_type: 'transaction',
          target_id: transactionId,
          details: { status, adminNotes }
        })

      // Update local state
      setTransactions(prev => 
        prev.map(t => t.id === transactionId ? { ...t, status } : t)
      )

      toast.success(`Transaction ${status} successfully`)
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to update transaction')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initialize transactions fetch
  useEffect(() => {
    if (userId) {
      fetchAllTransactions()
    }
  }, [userId, fetchAllTransactions])

  return {
    transactions,
    stats,
    loading,
    error,
    fetchAllTransactions,
    updateTransactionStatus
  }
}

export const useAdminComplaints = (userId) => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0
  })

  // Fetch all complaints for admin
  const fetchAllComplaints = useCallback(async (filters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('customer_complaints')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            phone
          ),
          transactions:transaction_id (
            disco_name,
            amount,
            token
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters.complaint_type) {
        query = query.eq('complaint_type', filters.complaint_type)
      }
      if (filters.assigned_admin_id) {
        query = query.eq('assigned_admin_id', filters.assigned_admin_id)
      }

      const { data, error } = await query

      if (error) throw error

      setComplaints(data || [])

      // Calculate stats
      const stats = {
        total: data?.length || 0,
        open: data?.filter(c => c.status === 'open').length || 0,
        in_progress: data?.filter(c => c.status === 'in_progress').length || 0,
        resolved: data?.filter(c => c.status === 'resolved').length || 0,
        closed: data?.filter(c => c.status === 'closed').length || 0
      }
      setStats(stats)

      return { success: true, data, stats }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to fetch complaints')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Update complaint status
  const updateComplaintStatus = useCallback(async (complaintId, status, adminNotes = '', resolution = '') => {
    try {
      setLoading(true)
      setError(null)

      const updateData = {
        status,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      }

      if (status === 'resolved' || status === 'closed') {
        updateData.resolution = resolution
        updateData.resolved_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('customer_complaints')
        .update(updateData)
        .eq('id', complaintId)
        .select()
        .single()

      if (error) throw error

      // Log admin activity
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: userId,
          action: 'update_complaint_status',
          target_type: 'complaint',
          target_id: complaintId,
          details: { status, adminNotes, resolution }
        })

      // Update local state
      setComplaints(prev => 
        prev.map(c => c.id === complaintId ? { ...c, ...updateData } : c)
      )

      toast.success(`Complaint ${status} successfully`)
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to update complaint')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Assign complaint to admin
  const assignComplaint = useCallback(async (complaintId, assignedAdminId) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('customer_complaints')
        .update({ 
          assigned_admin_id: assignedAdminId,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', complaintId)
        .select()
        .single()

      if (error) throw error

      // Log admin activity
      await supabase
        .from('admin_activity_log')
        .insert({
          admin_id: userId,
          action: 'assign_complaint',
          target_type: 'complaint',
          target_id: complaintId,
          details: { assignedAdminId }
        })

      // Update local state
      setComplaints(prev => 
        prev.map(c => c.id === complaintId ? { ...c, assigned_admin_id: assignedAdminId, status: 'in_progress' } : c)
      )

      toast.success('Complaint assigned successfully')
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      toast.error('Failed to assign complaint')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Initialize complaints fetch
  useEffect(() => {
    if (userId) {
      fetchAllComplaints()
    }
  }, [userId, fetchAllComplaints])

  return {
    complaints,
    stats,
    loading,
    error,
    fetchAllComplaints,
    updateComplaintStatus,
    assignComplaint
  }
}
