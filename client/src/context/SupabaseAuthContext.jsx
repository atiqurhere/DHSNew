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
    console.log('🔄 AuthProvider: Initializing auth check...')
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Session check result:', session ? 'Session found' : 'No session')
      setSession(session)
      if (session?.user) {
        console.log('👤 User found in session, fetching profile...')
        // Fetch full user profile from users table
        fetchUserProfile(session.user.id)
      } else {
        console.log('❌ No user in session')
        setUser(null)
        setLoading(false)
      }
    }).catch(error => {
      console.error('❌ Error getting session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state changed:', event, session ? 'with session' : 'no session')
        setSession(session)
        if (session?.user) {
          await fetchUserProfile(session.user.id)
          // Don't set loading here - fetchUserProfile handles it
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('🧹 AuthProvider: Cleaning up subscription')
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('⚠️ Profile fetch timeout - aborting request')
      controller.abort()
      setLoading(false)
    }, 5000) // 5 second timeout

    try {
      console.log('🔍 Fetching user profile for ID:', userId)
      const startTime = performance.now()
      
      // Use timeout signal
      const { data, error } = await Promise.race([
        supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )
      ])

      clearTimeout(timeoutId)
      const endTime = performance.now()
      console.log(`⏱️ Profile fetch took ${(endTime - startTime).toFixed(2)}ms`)

      if (error) {
        console.error('❌ Profile fetch error:', error)
        throw error
      }
      
      if (!data) {
        console.error('❌ No user data returned')
        setUser(null)
        setLoading(false)
        return
      }
      
      console.log('✅ User profile loaded:', data?.name)
      setUser(data)
      setLoading(false)
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('❌ Error fetching user profile:', error.message)
      
      // On timeout or error, still try to proceed with session user data
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        console.log('⚠️ Using basic user data from session')
        // Create minimal user object from session
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email,
          role: session.user.user_metadata?.role || 'patient'
        })
      } else {
        setUser(null)
      }
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
