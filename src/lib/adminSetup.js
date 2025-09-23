// Admin setup utilities
import { supabase } from './supabase.js'

export const adminSetup = {
  // Create a demo admin user (for development/testing)
  createDemoAdmin: async (email, password, role = 'admin') => {
    try {
      // First create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Admin User',
            role: role
          }
        }
      })

      if (authError) throw authError

      // Then add to admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          role: role,
          permissions: {
            view_transactions: true,
            update_transactions: true,
            view_complaints: true,
            update_complaints: true,
            assign_complaints: true,
            view_analytics: true
          },
          is_active: true
        })

      if (adminError) throw adminError

      console.log('✅ Demo admin user created successfully')
      return { success: true, data: { authData, adminData } }
    } catch (error) {
      console.error('❌ Error creating demo admin:', error)
      return { success: false, error: error.message }
    }
  },

  // Check if user is admin
  isUserAdmin: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, permissions, is_active')
        .eq('id', userId)
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return { isAdmin: !!data, role: data?.role, permissions: data?.permissions }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return { isAdmin: false, role: null, permissions: null }
    }
  },

  // Get admin permissions
  getAdminPermissions: (role) => {
    const permissions = {
      super_admin: {
        view_transactions: true,
        update_transactions: true,
        delete_transactions: true,
        view_complaints: true,
        update_complaints: true,
        assign_complaints: true,
        delete_complaints: true,
        view_analytics: true,
        manage_users: true,
        manage_admins: true
      },
      admin: {
        view_transactions: true,
        update_transactions: true,
        view_complaints: true,
        update_complaints: true,
        assign_complaints: true,
        view_analytics: true,
        manage_users: false,
        manage_admins: false
      },
      support_agent: {
        view_transactions: true,
        update_transactions: false,
        view_complaints: true,
        update_complaints: true,
        assign_complaints: false,
        view_analytics: false,
        manage_users: false,
        manage_admins: false
      }
    }

    return permissions[role] || {}
  }
}

// Demo admin credentials for testing
export const DEMO_ADMIN = {
  email: 'admin@powervend.com',
  password: 'admin123',
  role: 'admin'
}

// Instructions for setting up admin access
export const ADMIN_SETUP_INSTRUCTIONS = `
To set up admin access:

1. Create an admin user account:
   - Email: admin@powervend.com
   - Password: admin123
   - Role: admin

2. Or use the adminSetup.createDemoAdmin() function in the browser console:
   adminSetup.createDemoAdmin('admin@powervend.com', 'admin123', 'admin')

3. Admin features include:
   - View all transactions
   - Update transaction status
   - View and manage customer complaints
   - Access to analytics and reporting
   - User management (for super_admin)

4. Admin users will see an "Admin" tab in the bottom navigation
`
