import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'dhs-auth-token',
    // Don't refetch on every tab switch
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'dhs-healthcare'
    }
  }
})

// Database helpers for type-safe access
export const db = {
  users: () => supabase.from('users'),
  services: () => supabase.from('services'),
  bookings: () => supabase.from('bookings'),
  payments: () => supabase.from('payments'),
  notifications: () => supabase.from('notifications'),
  supportTickets: () => supabase.from('support_tickets'),
  feedback: () => supabase.from('feedback'),
  liveChatSessions: () => supabase.from('live_chat_sessions'),
  chatbotResponses: () => supabase.from('chatbot_responses'),
  telegramAgents: () => supabase.from('telegram_agents'),
  telegramBotConfig: () => supabase.from('telegram_bot_config'),
  pageContent: () => supabase.from('page_content')
}

// Storage helper
export const storage = {
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return { path, url: publicUrl }
  },
  
  delete: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  },
  
  getPublicUrl: (bucket, path) => {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return publicUrl
  }
}

export default supabase
