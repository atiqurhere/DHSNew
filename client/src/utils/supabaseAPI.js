import { supabase, db, storage } from '../lib/supabase'
import { cacheManager, cachedFetch } from './cache'

/**
 * Supabase API Helper
 * Replaces Axios-based API calls with Supabase client calls
 */

// ============= AUTH API =============

export const authAPI = {
  register: async (userData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            role: userData.role || 'patient'
          }
        }
      })

      if (authError) throw authError

      // Create user profile
      const userProfile = {
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role || 'patient',
        password_hash: 'managed_by_supabase_auth',
        address: userData.address || {},
        created_at: new Date().toISOString()
      }

      if (userData.role === 'staff') {
        userProfile.staff_type = userData.staff_type
        userProfile.is_verified = false
        userProfile.verification_status = 'pending'
      }

      const { error: dbError } = await db.users().insert(userProfile)
      if (dbError) throw dbError

      return { data: authData }
    } catch (error) {
      return { error: error.message }
    }
  },

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Get full user profile
      const { data: userProfile, error: profileError } = await db.users
        .select()
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // Check if staff is verified
      if (userProfile.role === 'staff' && !userProfile.is_verified) {
        await supabase.auth.signOut()
        throw new Error('Your staff account is pending admin approval')
      }

      return { data: { user: userProfile, session: data.session } }
    } catch (error) {
      return { error: error.message }
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { data: { message: 'Logged out successfully' } }
    } catch (error) {
      return { error: error.message }
    }
  },

  getProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await db.users().select().eq('id', user.id).single()
      if (error) throw error

      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  updateProfile: async (userId, updates) => {
    try {
      const { error } = await db.users().update(updates).eq('id', userId)
      if (error) throw error

      const { data } = await db.users().select().eq('id', userId).single()
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword
      })

      if (verifyError) throw new Error('Current password is incorrect')

      // Update password
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      return { data: { message: 'Password updated successfully' } }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// ============= SERVICES API =============

export const servicesAPI = {
  getAll: async () => {
    try {
      // Use cache for services list (5 minutes)
      const data = await cachedFetch('services:all', async () => {
        const { data, error } = await db.services()
          .select()
          .order('created_at', { ascending: false })

        if (error) throw error
        return data
      }, 5 * 60 * 1000) // 5 minutes cache

      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getById: async (id) => {
    try {
      // Cache individual service
      const data = await cachedFetch(`service:${id}`, async () => {
        const { data, error } = await db.services().select().eq('id', id).single()
        if (error) throw error
        return data
      }, 5 * 60 * 1000)

      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  create: async (serviceData) => {
    try {
      const { data, error } = await db.services().insert(serviceData)
      if (error) throw error
      
      // Invalidate services cache
      cacheManager.invalidatePattern(/^service/)
      
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  update: async (id, updates) => {
    try {
      const { data, error } = await db.services().update(updates).eq('id', id)
      if (error) throw error
      
      // Invalidate services cache
      cacheManager.invalidatePattern(/^service/)
      
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  delete: async (id) => {
    try {
      const { error } = await db.services().delete().eq('id', id)
      if (error) throw error
      
      // Invalidate services cache
      cacheManager.invalidatePattern(/^service/)
      
      return { data: { message: 'Service deleted successfully' } }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// ============= BOOKINGS API =============

export const bookingsAPI = {
  getAll: async () => {
    try {
      const { data, error } = await db.bookings
        .select('*, patient:users!patient_id(*), service:services(*), staff:users!staff_id(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getByUser: async (userId) => {
    try {
      const { data, error } = await db.bookings
        .select('*, service:services(*), staff:users!staff_id(*)')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getById: async (id) => {
    try {
      const { data, error } = await db.bookings
        .select('*, patient:users!patient_id(*), service:services(*), staff:users!staff_id(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  create: async (bookingData) => {
    try {
      const { data, error } = await db.bookings().insert({
        ...bookingData,
        created_at: new Date().toISOString()
      })

      if (error) throw error

      // Create notification for patient
      await db.notifications().insert({
        user_id: bookingData.patient_id,
        title: 'Booking Confirmed',
        message: `Your appointment has been scheduled for ${new Date(bookingData.appointment_date).toLocaleDateString()}`,
        type: 'booking_confirmation',
        related_id: data[0].id,
        related_model: 'bookings'
      })

      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  update: async (id, updates) => {
    try {
      const { data, error } = await db.bookings
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  cancel: async (id, reason) => {
    try {
      const { data, error } = await db.bookings
        .update({
          status: 'cancelled',
          cancellation_reason: reason,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// ============= PAYMENTS API =============

export const paymentsAPI = {
  getAll: async () => {
    try {
      const { data, error } = await db.payments
        .select('*, booking:bookings(*), user:users(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getByUser: async (userId) => {
    try {
      const { data, error } = await db.payments
        .select('*, booking:bookings(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  create: async (paymentData) => {
    try {
      const { data, error } = await db.payments().insert({
        ...paymentData,
        created_at: new Date().toISOString()
      })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  updateStatus: async (id, status, transactionId = null) => {
    try {
      const updates = {
        payment_status: status,
        updated_at: new Date().toISOString()
      }

      if (transactionId) {
        updates.transaction_id = transactionId
      }

      const { data, error } = await db.payments().update(updates).eq('id', id)
      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// ============= NOTIFICATIONS API =============

export const notificationsAPI = {
  getByUser: async (userId) => {
    try {
      // Cache notifications for 2 minutes (shorter than services since they update more frequently)
      const data = await cachedFetch(`notifications:user:${userId}`, async () => {
        const { data, error } = await db.notifications()
          .select()
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error
        return data
      }, 2 * 60 * 1000) // 2 minutes cache

      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  markAsRead: async (id) => {
    try {
      const { error } = await db.notifications()
        .update({ is_read: true })
        .eq('id', id)

      if (error) throw error
      
      // Invalidate notification cache when marking as read
      cacheManager.invalidatePattern(/^notifications:/)
      
      return { data: { message: 'Notification marked as read' } }
    } catch (error) {
      return { error: error.message }
    }
  },

  markAllAsRead: async (userId) => {
    try {
      const { error } = await db.notifications()
        .update({ is_read: true })
        .eq('user_id', userId)

      if (error) throw error
      
      // Invalidate notification cache
      cacheManager.invalidate(`notifications:user:${userId}`)
      
      return { data: { message: 'All notifications marked as read' } }
    } catch (error) {
      return { error: error.message }
    }
  },

  delete: async (id) => {
    try {
      const { error } = await db.notifications().delete().eq('id', id)
      if (error) throw error
      
      // Invalidate notification cache
      cacheManager.invalidatePattern(/^notifications:/)
      
      return { data: { message: 'Notification deleted' } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Subscribe to real-time notifications
  subscribe: (userId, callback) => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Invalidate cache when new notification arrives
          cacheManager.invalidate(`notifications:user:${userId}`)
          callback(payload.new)
        }
      )
      .subscribe()

    return subscription
  }
}

// ============= SUPPORT TICKETS API =============

export const supportAPI = {
  getAll: async () => {
    try {
      const { data, error } = await db.supportTickets()
        .select('*, user:users(*), assigned_to_user:users!assigned_to(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getByUser: async (userId) => {
    try {
      const { data, error } = await db.supportTickets()
        .select('*, assigned_to_user:users!assigned_to(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getById: async (id) => {
    try {
      const { data, error } = await db.supportTickets()
        .select('*, user:users(*), assigned_to_user:users!assigned_to(*)')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  create: async (ticketData) => {
    try {
      const { data, error } = await db.supportTickets().insert({
        ...ticketData,
        created_at: new Date().toISOString()
      })

      if (error) throw error

      // Notify admins
      const { data: admins } = await db.users().select('id').eq('role', 'admin')
      
      if (admins && admins.length > 0) {
        const notifications = admins.map(admin => ({
          user_id: admin.id,
          title: 'New Support Ticket',
          message: `New ticket: ${ticketData.subject}`,
          type: 'support_ticket',
          related_id: data[0].id,
          related_model: 'support_tickets'
        }))

        await db.notifications().insert(notifications)
      }

      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  update: async (id, updates) => {
    try {
      const { data, error } = await db.supportTickets()
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  addResponse: async (ticketId, userId, message) => {
    try {
      // Get current ticket
      const { data: ticket } = await db.supportTickets()
        .select('responses')
        .eq('id', ticketId)
        .single()

      const responses = ticket.responses || []
      responses.push({
        user_id: userId,
        message,
        created_at: new Date().toISOString()
      })

      const { data, error } = await db.supportTickets()
        .update({
          responses,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// ============= CHATBOT API =============

export const chatbotAPI = {
  getResponse: async (message) => {
    try {
      // Normalize message for better matching
      const normalizedMessage = message.toLowerCase().trim()
      
      // Search for matching response using keywords
      const { data, error } = await db.chatbot_responses
        .select()
        .eq('is_active', true)
        .order('priority', { ascending: false })

      if (error) throw error

      // Find best match
      let bestMatch = null
      let highestScore = 0

      if (data && data.length > 0) {
        for (const response of data) {
          const keywords = response.keywords || ''
          const keywordArray = keywords.toLowerCase().split(',').map(k => k.trim())
          
          let score = 0
          for (const keyword of keywordArray) {
            if (normalizedMessage.includes(keyword)) {
              score += keyword.length // Longer matches get higher scores
            }
          }

          if (score > highestScore) {
            highestScore = score
            bestMatch = response
          }
        }
      }

      if (bestMatch) {
        // Generate follow-up options based on category
        const followUpOptions = generateFollowUpOptions(bestMatch.category)
        
        return {
          data: {
            response: bestMatch.response,
            category: bestMatch.category,
            followUpOptions
          }
        }
      }

      // Return default response
      return {
        data: {
          response: "I'm sorry, I didn't understand that. Please try rephrasing your question or contact our support team for assistance.",
          category: 'general',
          followUpOptions: [
            { label: 'Contact Support', action: 'create_ticket' },
            { label: 'View Services', action: 'view_services' },
            { label: 'Talk to Agent', action: 'create_ticket' }
          ]
        }
      }
    } catch (error) {
      return {
        data: {
          response: "I'm experiencing technical difficulties. Please try again or contact support.",
          category: 'error',
          followUpOptions: [
            { label: 'Contact Support', action: 'create_ticket' }
          ]
        }
      }
    }
  }
}

// Helper function to generate follow-up options
function generateFollowUpOptions(category) {
  const options = {
    services: [
      { label: 'View All Services', action: 'view_services' },
      { label: 'Book a Service', action: 'book_service' },
      { label: 'Contact Support', action: 'create_ticket' }
    ],
    booking: [
      { label: 'Book Now', action: 'book_service' },
      { label: 'View Services', action: 'view_services' },
      { label: 'Contact Support', action: 'create_ticket' }
    ],
    support: [
      { label: 'Talk to Agent', action: 'create_ticket' },
      { label: 'View Contact Info', action: 'view_contact' },
      { label: 'Continue Chatting', action: 'continue' }
    ],
    pricing: [
      { label: 'View Pricing', action: 'view_pricing' },
      { label: 'View Services', action: 'view_services' },
      { label: 'Contact Support', action: 'create_ticket' }
    ],
    general: [
      { label: 'View Services', action: 'view_services' },
      { label: 'Contact Us', action: 'view_contact' },
      { label: 'Talk to Agent', action: 'create_ticket' }
    ]
  }

  return options[category] || options.general
}

// ============= TELEGRAM INTEGRATION API =============

export const telegramAPI = {
  // Get bot configuration
  getConfig: async () => {
    try {
      const { data, error } = await db.telegram_bot_config
        .select()
        .limit(1)
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return { data: null }
        }
        throw error
      }

      return { data: { config: data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Update bot configuration
  updateConfig: async (config) => {
    try {
      // Check if config exists
      const { data: existing } = await db.telegram_bot_config
        .select('id')
        .limit(1)
        .single()

      let result
      if (existing) {
        // Update existing
        result = await db.telegram_bot_config
          .update(config)
          .eq('id', existing.id)
          .select()
          .single()
      } else {
        // Insert new
        result = await db.telegram_bot_config
          .insert([config])
          .select()
          .single()
      }

      if (result.error) throw result.error

      return { data: { config: result.data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Get all agents
  getAgents: async () => {
    try {
      const { data, error } = await db.telegram_agents
        .select()
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: { agents: data || [] } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Add new agent
  addAgent: async (agent) => {
    try {
      const { data, error } = await db.telegram_agents
        .insert([{
          name: agent.name,
          telegram_user_id: agent.telegramUserId,
          telegram_username: agent.telegramUsername,
          is_active: true,
          is_available: true
        }])
        .select()
        .single()

      if (error) throw error

      return { data: { agent: data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Update agent
  updateAgent: async (id, agent) => {
    try {
      const { data, error } = await db.telegram_agents
        .update({
          name: agent.name,
          telegram_user_id: agent.telegramUserId,
          telegram_username: agent.telegramUsername
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data: { agent: data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Delete agent
  deleteAgent: async (id) => {
    try {
      const { error } = await db.telegram_agents
        .delete()
        .eq('id', id)

      if (error) throw error

      return { data: { message: 'Agent deleted successfully' } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Toggle agent status
  toggleAgentStatus: async (id, isActive) => {
    try {
      const { data, error } = await db.telegram_agents
        .update({ is_active: isActive })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return { data: { agent: data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Check agent availability
  checkAvailability: async () => {
    try {
      const { data, error } = await db.telegram_agents
        .select('id')
        .eq('is_active', true)
        .eq('is_available', true)
        .limit(1)

      if (error) throw error

      return {
        data: {
          available: data && data.length > 0,
          message: data && data.length > 0 
            ? 'Agents are available' 
            : 'No agents available at the moment'
        }
      }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Create live chat session
  connectToAgent: async (userId) => {
    try {
      // Find available agent
      const { data: agent, error: agentError } = await db.telegram_agents
        .select()
        .eq('is_active', true)
        .eq('is_available', true)
        .limit(1)
        .single()

      if (agentError || !agent) {
        return {
          error: 'No agents available. Please try again later or create a support ticket.'
        }
      }

      // Create chat session
      const { data: session, error: sessionError } = await db.live_chat_sessions
        .insert([{
          user_id: userId,
          agent_id: agent.id,
          status: 'waiting',
          messages: []
        }])
        .select()
        .single()

      if (sessionError) throw sessionError

      return {
        data: {
          sessionId: session.id,
          agentName: agent.name,
          message: `Connected to ${agent.name}. They will respond shortly.`
        }
      }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Get session details
  getSession: async (sessionId) => {
    try {
      const { data, error } = await db.live_chat_sessions
        .select(`
          *,
          agent:telegram_agents(name, telegram_username)
        `)
        .eq('id', sessionId)
        .single()

      if (error) throw error

      return { data: { session: data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Send message in session
  sendMessage: async (sessionId, message, sender = 'user') => {
    try {
      // Get current session
      const { data: session, error: fetchError } = await db.live_chat_sessions
        .select('messages, status')
        .eq('id', sessionId)
        .single()

      if (fetchError) throw fetchError

      if (session.status === 'ended') {
        return { error: 'This chat session has ended' }
      }

      // Add message to messages array
      const newMessage = {
        sender,
        message,
        timestamp: new Date().toISOString()
      }

      const updatedMessages = [...(session.messages || []), newMessage]

      // Update session
      const { data, error } = await db.live_chat_sessions
        .update({
          messages: updatedMessages,
          last_message_at: new Date().toISOString(),
          status: session.status === 'waiting' ? 'connected' : session.status
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error

      return { data: { message: 'Message sent', session: data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const { data, error } = await db.live_chat_sessions
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error) throw error

      return { data: { message: 'Session ended', session: data } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Get all sessions (admin)
  getAllSessions: async () => {
    try {
      const { data, error } = await db.live_chat_sessions
        .select(`
          *,
          user:users(name, email),
          agent:telegram_agents(name, telegram_username)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data: { sessions: data || [] } }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// ============= FILE UPLOAD API =============

export const uploadAPI = {
  uploadFile: async (file, bucket = 'uploads') => {
    try {
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await storage.upload(bucket, fileName, file)

      if (error) throw error

      const publicUrl = storage.getPublicUrl(bucket, fileName)
      return { data: { url: publicUrl, path: fileName } }
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteFile: async (path, bucket = 'uploads') => {
    try {
      const { error } = await storage.delete(bucket, path)
      if (error) throw error
      return { data: { message: 'File deleted successfully' } }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// ============= ADMIN API =============

export const adminAPI = {
  // Users Management
  getAllUsers: async () => {
    try {
      const { data, error } = await db.users()
        .select()
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const { data, error } = await db.users().update(updates).eq('id', userId)
      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteUser: async (userId) => {
    try {
      const { error } = await db.users().delete().eq('id', userId)
      if (error) throw error
      return { data: { message: 'User deleted successfully' } }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Staff Management
  verifyStaff: async (staffId) => {
    try {
      const { data, error } = await db.users()
        .update({
          is_verified: true,
          verification_status: 'verified',
          verified_at: new Date().toISOString()
        })
        .eq('id', staffId)

      if (error) throw error

      // Notify staff
      await db.notifications().insert({
        user_id: staffId,
        title: 'Account Verified',
        message: 'Your staff account has been verified. You can now log in.',
        type: 'verification'
      })

      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Dashboard Stats
  getStats: async () => {
    try {
      // Get user counts by role
      const { data: users } = await db.users().select('role')
      const patients = users?.filter(u => u.role === 'patient').length || 0
      const staff = users?.filter(u => u.role === 'staff' && u.is_verified).length || 0
      const pendingStaff = users?.filter(u => u.role === 'staff' && !u.is_verified).length || 0

      // Get booking stats
      const { data: bookings } = await db.bookings().select('status')
      const totalBookings = bookings?.length || 0
      const pendingBookings = bookings?.filter(b => b.status === 'pending').length || 0

      // Get payment stats
      const { data: payments } = await db.payments().select('amount, status, created_at')
      const totalRevenue = payments
        ?.filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0
      
      const currentMonth = new Date().getMonth()
      const monthlyRevenue = payments
        ?.filter(p => p.status === 'completed' && new Date(p.created_at).getMonth() === currentMonth)
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      return {
        data: {
          users: {
            total: users?.length || 0,
            patients,
            staff,
            pendingStaff
          },
          bookings: {
            total: totalBookings,
            pending: pendingBookings
          },
          revenue: {
            total: totalRevenue,
            monthly: monthlyRevenue
          }
        }
      }
    } catch (error) {
      console.error('getStats error:', error)
      return { error: error.message }
    }
  }
}

// ============= PAGE CONTENT API =============

export const pagesAPI = {
  getBySlug: async (slug) => {
    try {
      const { data, error } = await db.pageContent()
        .select()
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  },

  update: async (id, updates) => {
    try {
      const { data, error } = await db.pageContent()
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      return { data }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Export all APIs
export default {
  auth: authAPI,
  services: servicesAPI,
  bookings: bookingsAPI,
  payments: paymentsAPI,
  notifications: notificationsAPI,
  support: supportAPI,
  chatbot: chatbotAPI,
  telegram: telegramAPI,
  upload: uploadAPI,
  admin: adminAPI,
  pages: pagesAPI
}
