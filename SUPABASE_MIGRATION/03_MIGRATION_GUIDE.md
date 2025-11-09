# Complete Supabase Migration Guide for DHS Healthcare App

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Authentication Strategy](#authentication-strategy)
5. [File Storage Migration](#file-storage-migration)
6. [Edge Functions](#edge-functions)
7. [Deployment Guide](#deployment-guide)

---

## Prerequisites

### Required Accounts & Tools
- **Supabase Account**: Sign up at https://supabase.com
- **Vercel Account**: Sign up at https://vercel.com
- **Node.js**: v18+ installed
- **Git**: For version control

### Install Supabase CLI
```bash
npm install -g supabase
```

---

## Architecture Overview

### Before (MERN Stack)
```
┌─────────────┐     HTTP      ┌──────────────┐     MongoDB    ┌──────────┐
│   React     │ ─────────────> │  Express.js  │ ────────────> │ MongoDB  │
│  (Vite)     │                │   Backend    │                │          │
└─────────────┘                └──────────────┘                └──────────┘
                                       │
                                       ├─ Mongoose ODM
                                       ├─ JWT Auth
                                       ├─ Local File Storage
                                       ├─ Nodemailer
                                       └─ Telegram Bot
```

### After (Supabase)
```
┌─────────────┐     Direct      ┌──────────────┐
│   React     │ ─────────────> │   Supabase   │
│  (Vite)     │                │              │
└─────────────┘                ├─ PostgreSQL  │
                                ├─ Auth        │
                                ├─ Storage     │
                                ├─ Edge Fns    │
                                └─ Realtime    │
```

### Benefits
- ✅ **Single Deployment**: Frontend-only on Vercel
- ✅ **Serverless**: No backend server to maintain
- ✅ **Real-time**: Built-in WebSocket support
- ✅ **Type-safe**: Auto-generated TypeScript types
- ✅ **Scalable**: Auto-scaling infrastructure
- ✅ **Cost-effective**: Pay per usage

---

## Step-by-Step Migration

### Phase 1: Setup Supabase Project (30 minutes)

#### 1.1 Create Supabase Project
```bash
# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref
```

#### 1.2 Run Database Schema
```bash
# Apply the schema (from 01_DATABASE_SCHEMA.sql)
supabase db push

# Or manually in Supabase Dashboard:
# Go to SQL Editor > New Query > Paste schema
```

#### 1.3 Apply Row Level Security
```bash
# Apply RLS policies (from 02_ROW_LEVEL_SECURITY.sql)
# Run in Supabase SQL Editor
```

#### 1.4 Get Your Credentials
In Supabase Dashboard > Settings > API:
- **Project URL**: `https://xxxxx.supabase.co`
- **anon public key**: `eyJhbGc...` (safe for frontend)
- **service_role key**: `eyJhbGc...` (server-only, for Edge Functions)

---

### Phase 2: Setup Client (Supabase JS Client)

#### 2.1 Install Dependencies
```bash
cd client
npm install @supabase/supabase-js
npm install date-fns uuid # Additional utilities
```

#### 2.2 Create Supabase Client
Create `client/src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Type-safe database access (optional but recommended)
export const db = {
  users: () => supabase.from('users'),
  services: () => supabase.from('services'),
  bookings: () => supabase.from('bookings'),
  payments: () => supabase.from('payments'),
  notifications: () => supabase.from('notifications'),
  supportTickets: () => supabase.from('support_tickets'),
  feedback: () => supabase.from('feedback'),
  chatbotResponses: () => supabase.from('chatbot_responses'),
  pageContent: () => supabase.from('page_content'),
}
```

#### 2.3 Environment Variables
Create `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

### Phase 3: Authentication Migration

#### Option A: Use Supabase Auth (Recommended)

**Pros**: Built-in, secure, handles sessions, email verification
**Cons**: Slight API changes needed

##### Setup Auth Context
Create `client/src/context/SupabaseAuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signUp: async (data) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
            role: data.role || 'patient',
            address: data.address
          }
        }
      })
      
      if (error) throw error
      
      // Create user in public.users table
      if (authData.user) {
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: data.role || 'patient',
            address: data.address,
            password_hash: 'managed_by_supabase_auth'
          })
        
        if (dbError) throw dbError
      }
      
      return authData
    },
    
    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    },
    
    signOut: () => supabase.auth.signOut(),
    
    updateProfile: async (updates) => {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
      
      if (error) throw error
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
```

#### Option B: Keep Custom JWT (Requires Edge Function)

**Pros**: Minimal code changes
**Cons**: Need to maintain auth logic in Edge Function

See `04_EDGE_FUNCTIONS.md` for custom JWT implementation.

---

### Phase 4: Replace Axios Calls with Supabase

#### Example: Booking Operations

**Before (MongoDB/Express):**
```javascript
// Create booking
const response = await api.post('/bookings', bookingData)
```

**After (Supabase):**
```javascript
// Create booking
const { data, error } = await supabase
  .from('bookings')
  .insert({
    patient_id: user.id,
    service_id: serviceId,
    scheduled_date: scheduledDate,
    scheduled_time: scheduledTime,
    address: address,
    notes: notes,
    status: 'pending'
  })
  .select(`
    *,
    service:services(*),
    patient:users!bookings_patient_id_fkey(name, email, phone)
  `)
  .single()

if (error) throw error
```

#### Query Patterns Comparison

| Operation | Mongoose | Supabase |
|-----------|----------|----------|
| **Find All** | `Model.find()` | `.select()` |
| **Find One** | `Model.findById(id)` | `.select().eq('id', id).single()` |
| **Create** | `Model.create(data)` | `.insert(data)` |
| **Update** | `Model.findByIdAndUpdate(id, data)` | `.update(data).eq('id', id)` |
| **Delete** | `Model.findByIdAndDelete(id)` | `.delete().eq('id', id)` |
| **Populate** | `.populate('field')` | `.select('*, field(*)')` |
| **Filter** | `.find({ status: 'active' })` | `.select().eq('status', 'active')` |
| **Sort** | `.sort({ createdAt: -1 })` | `.order('created_at', { ascending: false })` |

---

### Phase 5: File Storage Migration

#### 5.1 Create Storage Bucket
```bash
# In Supabase Dashboard > Storage > New Bucket
# Bucket name: dhs-uploads
# Public: Yes (for service images)
# File size limit: 5MB
```

#### 5.2 Upload Utility
Create `client/src/lib/storage.js`:

```javascript
import { supabase } from './supabase'

export const uploadFile = async (file, folder = 'general') => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { data, error } = await supabase.storage
    .from('dhs-uploads')
    .upload(filePath, file)

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('dhs-uploads')
    .getPublicUrl(filePath)

  return { path: filePath, url: publicUrl }
}

export const deleteFile = async (path) => {
  const { error } = await supabase.storage
    .from('dhs-uploads')
    .remove([path])

  if (error) throw error
}

// Usage example:
// const { url } = await uploadFile(file, 'service-images')
```

#### 5.3 Storage Policies
In Supabase Dashboard > Storage > Policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'dhs-uploads');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dhs-uploads' AND auth.role() = 'authenticated');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'dhs-uploads' AND auth.uid() = owner);
```

---

### Phase 6: Real-time Features

#### 6.1 Real-time Notifications

```javascript
// Subscribe to new notifications
const subscribeToNotifications = (userId, callback) => {
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
        callback(payload.new)
      }
    )
    .subscribe()

  return () => subscription.unsubscribe()
}

// Usage in component:
useEffect(() => {
  if (!user) return
  
  const unsubscribe = subscribeToNotifications(user.id, (notification) => {
    // Update UI with new notification
    setNotifications(prev => [notification, ...prev])
    showToast(notification.title)
  })

  return unsubscribe
}, [user])
```

#### 6.2 Live Chat with Real-time

```javascript
// Join chat session
const joinChatSession = (sessionId) => {
  const channel = supabase.channel(`chat:${sessionId}`)
  
  channel
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'live_chat_sessions',
      filter: `id=eq.${sessionId}`
    }, (payload) => {
      // Update messages in UI
      setMessages(payload.new.messages)
    })
    .subscribe()

  return channel
}

// Send message
const sendMessage = async (sessionId, message) => {
  const { data: session } = await supabase
    .from('live_chat_sessions')
    .select('messages')
    .eq('id', sessionId)
    .single()

  const newMessages = [
    ...(session.messages || []),
    {
      sender: 'user',
      message,
      timestamp: new Date().toISOString()
    }
  ]

  await supabase
    .from('live_chat_sessions')
    .update({
      messages: newMessages,
      last_message_at: new Date().toISOString()
    })
    .eq('id', sessionId)
}
```

---

### Phase 7: Migrate Backend Logic to Edge Functions

See `04_EDGE_FUNCTIONS.md` for detailed Edge Function implementations for:
- Email notifications
- Telegram bot integration
- Scheduled cleanup jobs
- Payment processing
- Complex business logic

---

## Quick Start Commands

```bash
# 1. Setup Supabase
supabase init
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 2. Apply migrations
supabase db push

# 3. Install dependencies
cd client
npm install @supabase/supabase-js

# 4. Update environment variables
echo "VITE_SUPABASE_URL=your-url" > .env
echo "VITE_SUPABASE_ANON_KEY=your-key" >> .env

# 5. Start development
npm run dev
```

---

## Migration Checklist

- [ ] Create Supabase project
- [ ] Apply database schema
- [ ] Apply RLS policies
- [ ] Setup storage buckets
- [ ] Install Supabase client
- [ ] Migrate authentication
- [ ] Replace API calls (bookings, services, etc.)
- [ ] Migrate file uploads
- [ ] Setup real-time subscriptions
- [ ] Create Edge Functions for:
  - [ ] Email notifications
  - [ ] Telegram bot
  - [ ] Cron jobs
- [ ] Test all features
- [ ] Deploy to Vercel

---

## Next Steps

1. **Review** `01_DATABASE_SCHEMA.sql` - Understand the database structure
2. **Review** `02_ROW_LEVEL_SECURITY.sql` - Understand security policies
3. **Follow** this guide step-by-step
4. **Implement** Edge Functions (see `04_EDGE_FUNCTIONS.md`)
5. **Deploy** using `05_DEPLOYMENT_GUIDE.md`

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Discord**: https://discord.supabase.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
