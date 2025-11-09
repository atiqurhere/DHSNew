# Supabase Migration - Quick Reference Cheat Sheet

## 🔥 Essential Commands

### Setup
```bash
# Install CLI
npm install -g supabase

# Login
supabase login

# Initialize project
supabase init

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Install client
npm install @supabase/supabase-js
```

### Development
```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database
supabase db reset

# Run migration
supabase db push

# Generate types
supabase gen types typescript --local > database.types.ts
```

### Deployment
```bash
# Deploy Edge Function
supabase functions deploy function-name

# Set secrets
supabase secrets set KEY=value

# View logs
supabase functions logs function-name
```

---

## 📊 Query Patterns

### SELECT
```javascript
// All rows
const { data } = await supabase.from('users').select()

// Specific columns
const { data } = await supabase.from('users').select('id, name, email')

// With filter
const { data } = await supabase.from('users').select().eq('role', 'admin')

// Multiple filters
const { data } = await supabase.from('bookings').select()
  .eq('patient_id', userId)
  .eq('status', 'pending')
  .order('created_at', { ascending: false })

// With join (populate)
const { data } = await supabase.from('bookings').select(`
  *,
  service:services(name, price),
  patient:users!bookings_patient_id_fkey(name, email)
`)

// Single row
const { data } = await supabase.from('users').select().eq('id', id).single()

// Count
const { count } = await supabase.from('users').select('*', { count: 'exact', head: true })

// Pagination
const { data } = await supabase.from('bookings').select()
  .range(0, 9) // First 10 rows (0-9)

// Search
const { data } = await supabase.from('services').select()
  .ilike('name', '%health%')

// OR condition
const { data } = await supabase.from('bookings').select()
  .or('status.eq.pending,status.eq.accepted')

// IN operator
const { data } = await supabase.from('users').select()
  .in('role', ['admin', 'staff'])
```

### INSERT
```javascript
// Single row
const { data, error } = await supabase.from('users').insert({
  name: 'John',
  email: 'john@example.com'
}).select().single()

// Multiple rows
const { data, error } = await supabase.from('notifications').insert([
  { user_id: '123', message: 'Hello' },
  { user_id: '456', message: 'World' }
]).select()
```

### UPDATE
```javascript
// Update row
const { data, error } = await supabase.from('bookings')
  .update({ status: 'completed' })
  .eq('id', bookingId)
  .select()

// Update multiple rows
const { data, error } = await supabase.from('notifications')
  .update({ is_read: true })
  .eq('user_id', userId)
```

### DELETE
```javascript
// Delete row
const { error } = await supabase.from('bookings')
  .delete()
  .eq('id', bookingId)

// Delete multiple rows
const { error } = await supabase.from('notifications')
  .delete()
  .eq('user_id', userId)
  .eq('is_read', true)
```

### UPSERT (Insert or Update)
```javascript
const { data, error } = await supabase.from('users')
  .upsert({ id: userId, name: 'John', email: 'john@example.com' })
  .select()
```

---

## 🔐 Authentication

### Supabase Auth
```javascript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: { name: 'John Doe', phone: '1234567890' }
  }
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Get session
const { data: { session } } = await supabase.auth.getSession()

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})

// Update user
const { data, error } = await supabase.auth.updateUser({
  data: { name: 'Jane Doe' }
})

// Reset password
await supabase.auth.resetPasswordForEmail('user@example.com')
```

---

## 📦 Storage

### Upload File
```javascript
const file = event.target.files[0]
const filePath = `folder/${Date.now()}_${file.name}`

const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload(filePath, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('bucket-name')
  .getPublicUrl(filePath)
```

### Download File
```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .download(filePath)
```

### Delete File
```javascript
const { error } = await supabase.storage
  .from('bucket-name')
  .remove([filePath])
```

### List Files
```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .list('folder', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  })
```

---

## ⚡ Real-time

### Subscribe to Changes
```javascript
// Subscribe to INSERT
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('New notification:', payload.new)
  })
  .subscribe()

// Subscribe to UPDATE
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'bookings',
    filter: `id=eq.${bookingId}`
  }, (payload) => {
    console.log('Booking updated:', payload.new)
  })
  .subscribe()

// Subscribe to DELETE
const subscription = supabase
  .channel('services')
  .on('postgres_changes', {
    event: 'DELETE',
    schema: 'public',
    table: 'services'
  }, (payload) => {
    console.log('Service deleted:', payload.old)
  })
  .subscribe()

// Subscribe to all events
const subscription = supabase
  .channel('all-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    console.log('Change:', payload)
  })
  .subscribe()

// Unsubscribe
subscription.unsubscribe()
```

---

## 🔧 Edge Functions

### Call Function
```javascript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { key: 'value' }
})
```

### Basic Function Template
```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  try {
    const { data } = await req.json()
    
    // Your logic here
    
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 🎯 Common Operations

### Get User Profile
```javascript
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()
```

### Create Booking with Relations
```javascript
const { data: booking } = await supabase
  .from('bookings')
  .insert({
    patient_id: userId,
    service_id: serviceId,
    scheduled_date: date,
    scheduled_time: time,
    status: 'pending'
  })
  .select(`
    *,
    service:services(*),
    patient:users!bookings_patient_id_fkey(name, email, phone)
  `)
  .single()
```

### Update Booking Status
```javascript
const { error } = await supabase
  .from('bookings')
  .update({ status: 'completed', completed_at: new Date().toISOString() })
  .eq('id', bookingId)
```

### Get Notifications with Count
```javascript
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

const { count: unreadCount } = await supabase
  .from('notifications')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .eq('is_read', false)
```

### Search Services
```javascript
const { data: services } = await supabase
  .from('services')
  .select('*')
  .or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  .eq('is_available', true)
```

### Admin Dashboard Stats
```javascript
// Total bookings
const { count: totalBookings } = await supabase
  .from('bookings')
  .select('*', { count: 'exact', head: true })

// Pending bookings
const { count: pendingBookings } = await supabase
  .from('bookings')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'pending')

// Total revenue
const { data: payments } = await supabase
  .from('payments')
  .select('amount')
  .eq('status', 'completed')

const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
```

---

## 🔍 JSONB Operations

### Query JSONB
```javascript
// Contains
const { data } = await supabase
  .from('users')
  .select('*')
  .contains('permissions', { manageServices: true })

// Get specific field
const { data } = await supabase
  .from('users')
  .select('address->city')

// Update JSONB field
const { data } = await supabase
  .from('users')
  .update({
    permissions: {
      manageServices: true,
      manageStaff: false
    }
  })
  .eq('id', userId)
```

---

## ⚠️ Error Handling

```javascript
const { data, error } = await supabase
  .from('bookings')
  .select('*')

if (error) {
  console.error('Error code:', error.code)
  console.error('Error message:', error.message)
  console.error('Error details:', error.details)
  console.error('Error hint:', error.hint)
}
```

---

## 📱 Environment Variables

### Client (.env)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Edge Functions
```bash
# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set TELEGRAM_BOT_TOKEN=xxxxx
supabase secrets set CRON_SECRET=xxxxx

# Access in function
const apiKey = Deno.env.get('RESEND_API_KEY')
```

---

## 🐛 Debugging

### Enable Logs
```javascript
// Show SQL queries in console
const { data } = await supabase
  .from('bookings')
  .select('*')
  .explain({ analyze: true, verbose: true })
```

### Check RLS
```javascript
// If query returns empty but data exists, check RLS policies
// Test with service role key temporarily (NEVER in production!)
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
)
```

---

## 📊 Performance Tips

```javascript
// ✅ Good: Select only needed columns
.select('id, name, email')

// ❌ Bad: Select everything
.select('*')

// ✅ Good: Use single() for one row
.select().eq('id', id).single()

// ❌ Bad: Get array then [0]
.select().eq('id', id).then(d => d[0])

// ✅ Good: Batch inserts
.insert([...items])

// ❌ Bad: Loop inserts
for (item of items) await .insert(item)

// ✅ Good: Use indexes (already in schema)
.eq('patient_id', userId) // Uses idx_bookings_patient_id

// ✅ Good: Limit results
.limit(50)
```

---

## 🎓 Learn More

- **Supabase Docs**: https://supabase.com/docs
- **JS Client Docs**: https://supabase.com/docs/reference/javascript
- **SQL Docs**: https://supabase.com/docs/guides/database
- **Auth Docs**: https://supabase.com/docs/guides/auth
- **Storage Docs**: https://supabase.com/docs/guides/storage
- **Realtime Docs**: https://supabase.com/docs/guides/realtime

---

**Print this and keep it handy! 📌**
