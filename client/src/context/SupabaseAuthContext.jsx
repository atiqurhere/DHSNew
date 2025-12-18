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
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)

  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing auth check...')
    let isInitialized = false
    
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Session check result:', session ? 'Session found' : 'No session')
      setSession(session)
      if (session?.user && !isInitialized) {
        console.log('👤 User found in session, fetching profile...')
        isInitialized = true
        fetchUserProfile(session.user.id)
      } else if (!session) {
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
        
        if (event === 'INITIAL_SESSION' && isInitialized) {
          console.log('⏭️ Skipping INITIAL_SESSION - already initialized')
          return
        }
        
        if (event === 'SIGNED_IN' && user && session?.user?.id === user.id) {
          console.log('⏭️ Skipping SIGNED_IN - user already loaded')
          setSession(session)
          return
        }
        
        setSession(session)
        if (session?.user && event !== 'INITIAL_SESSION') {
          await fetchUserProfile(session.user.id)
        } else if (!session) {
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
    if (isFetchingProfile) {
      console.log('⏭️ Profile fetch already in progress, skipping...')
      return
    }

    setIsFetchingProfile(true)
    console.log('🔍 Fetching user profile from database...')
    const startTime = performance.now()
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, phone, role, address, staff_type, is_verified, created_at, profile_picture')
        .eq('id', userId)
        .single()

      const endTime = performance.now()
      console.log(`⏱️ Profile fetch took ${(endTime - startTime).toFixed(2)}ms`)

      if (error) {
        console.error('❌ Database fetch failed:', error.message)
        throw error
      }
      
      if (data) {
        console.log('✅ Full profile loaded from DB:', data.name, `(${data.role})`)
        setUser(data)
        setLoading(false)
        setIsFetchingProfile(false)
        return
      }
    } catch (dbError) {
      console.warn('⚠️ Database fetch failed, using session fallback:', dbError.message)
      
      // Fallback: Use session metadata
      const currentSession = session
      
      if (currentSession?.user) {
        const basicUser = {
          id: currentSession.user.id,
          email: currentSession.user.email,
          name: currentSession.user.user_metadata?.name || currentSession.user.email?.split('@')[0] || 'User',
          role: currentSession.user.user_metadata?.role || 'patient',
          phone: currentSession.user.user_metadata?.phone || '',
          created_at: currentSession.user.created_at
        }
        console.log('✅ User loaded from session metadata:', basicUser.name, `(${basicUser.role})`)
        setUser(basicUser)
        setLoading(false)
      } else {
        console.error('❌ No session available for fallback')
        setUser(null)
        setLoading(false)
      }
    }
    
    setIsFetchingProfile(false)
  }

  const signUp = async ({ name, email, password, phone, role = 'patient', address, staffType }) => {
    try {
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

        if (role === 'staff') {
          userData.staff_type = staffType
          userData.is_verified = false
          userData.verification_status = 'pending'
        }

        const { error: dbError } = await supabase
          .from('users')
          .insert(userData)

        if (dbError) throw dbError

        await supabase.from('notifications').insert({
          user_id: authData.user.id,
          title: 'Welcome to DHS Healthcare',
          message: `Welcome ${name}! Your account has been created successfully.`,
          type: 'welcome',
          is_read: false
        })

        if (role === 'staff') {
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

      await fetchUserProfile(user.id)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (verifyError) throw new Error('Current password is incorrect')

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
