import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { cacheManager } from '../utils/cache'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        // Fetch full user profile from users table
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      
      setUser(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setLoading(false)
    }
  }

  const signUp = async ({ name, email, password, phone, role = 'patient', address, staffType }) => {
    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            role
          }
        }
      })

      if (authError) throw authError

      // 2. Create user profile in public.users table
      if (authData.user) {
        const userData = {
          id: authData.user.id,
          name,
          email,
          phone,
          role: role || 'patient',
          password_hash: 'managed_by_supabase_auth',
          address: address || {},
          created_at: new Date().toISOString()
        }

        // Add staff-specific fields
        if (role === 'staff') {
          userData.staff_type = staffType
          userData.is_verified = false
          userData.verification_status = 'pending'
        }

        const { error: dbError } = await supabase
          .from('users')
          .insert(userData)

        if (dbError) throw dbError

        // 3. Create welcome notification
        await supabase.from('notifications').insert({
          user_id: authData.user.id,
          title: 'Welcome to DHS Healthcare',
          message: `Welcome ${name}! Your account has been created successfully.`,
          type: 'welcome',
          is_read: false
        })

        // 4. If staff, notify admins
        if (role === 'staff') {
          // Get all admins
          const { data: admins } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'admin')

          if (admins && admins.length > 0) {
            const adminNotifications = admins.map(admin => ({
              user_id: admin.id,
              title: 'New Staff Application',
              message: `${name} has applied as ${staffType}. Please review their application.`,
              type: 'staff_application',
              related_id: authData.user.id,
              related_model: 'users',
              is_read: false
            }))

            await supabase.from('notifications').insert(adminNotifications)
          }
        }
      }

      return authData
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Check if staff is verified
      if (data.user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('role, is_verified')
          .eq('id', data.user.id)
          .single()

        if (userProfile?.role === 'staff' && !userProfile.is_verified) {
          await supabase.auth.signOut()
          throw new Error('Your staff account is pending admin approval')
        }
      }

      return data
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setSession(null)
      // Clear all cached data on logout
      cacheManager.clear()
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Refresh user profile
      await fetchUserProfile(user.id)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      // Verify current password by trying to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (verifyError) throw new Error('Current password is incorrect')

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    refreshProfile: () => user ? fetchUserProfile(user.id) : null
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export default AuthContext
