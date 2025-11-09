# Supabase Edge Functions Guide

## Overview
Edge Functions replace your Express.js backend logic. They run on Deno (TypeScript/JavaScript) at the edge for low latency.

---

## Setup Edge Functions

### Install Supabase CLI
```bash
npm install -g supabase
```

### Initialize Edge Functions
```bash
cd SUPABASE_MIGRATION
supabase functions new email-notification
supabase functions new telegram-bot
supabase functions new cleanup-sessions
supabase functions new custom-auth
```

---

## 1. Email Notification Edge Function

**File**: `supabase/functions/email-notification/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface EmailPayload {
  to: string
  subject: string
  html: string
  from?: string
}

serve(async (req) => {
  try {
    const { to, subject, html, from = 'DHS Healthcare <noreply@dhshealthcare.com>' } = 
      await req.json() as EmailPayload

    // Send email using Resend API (better than nodemailer for serverless)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Email error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

### Email Templates Helper

**File**: `supabase/functions/_shared/emailTemplates.ts`

```typescript
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to DHS Healthcare',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining DHS Healthcare. We're here to provide you with the best healthcare services.</p>
      <p>You can now book appointments, order medicine, and access all our services.</p>
    `
  }),

  bookingConfirmed: (name: string, service: string, date: string, time: string) => ({
    subject: 'Booking Confirmed',
    html: `
      <h1>Booking Confirmed</h1>
      <p>Dear ${name},</p>
      <p>Your booking has been confirmed!</p>
      <ul>
        <li><strong>Service:</strong> ${service}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p>Our staff will contact you shortly.</p>
    `
  }),

  staffVerified: (name: string) => ({
    subject: 'Staff Account Verified',
    html: `
      <h1>Congratulations ${name}!</h1>
      <p>Your staff account has been verified by our admin team.</p>
      <p>You can now log in and start accepting assignments.</p>
    `
  })
}
```

### Usage from Frontend

```javascript
// Send email notification
const sendEmail = async (to, subject, html) => {
  const { data, error } = await supabase.functions.invoke('email-notification', {
    body: { to, subject, html }
  })
  
  if (error) console.error('Email error:', error)
  return data
}

// Example: Send welcome email
await sendEmail(
  user.email,
  'Welcome to DHS Healthcare',
  `<h1>Welcome ${user.name}!</h1>...`
)
```

---

## 2. Telegram Bot Edge Function

**File**: `supabase/functions/telegram-bot/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    username?: string
    first_name: string
  }
  chat: {
    id: number
  }
  text?: string
}

const sendTelegramMessage = async (chatId: number, text: string) => {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    }
  )
  return response.json()
}

serve(async (req) => {
  try {
    const { message } = await req.json() as { message: TelegramMessage }
    
    if (!message?.text) {
      return new Response('OK', { status: 200 })
    }

    const chatId = message.chat.id
    const text = message.text
    const telegramUserId = message.from.id.toString()

    // Check if agent exists
    const { data: agent } = await supabase
      .from('telegram_agents')
      .select('*')
      .eq('telegram_user_id', telegramUserId)
      .single()

    // Handle commands
    if (text === '/start') {
      if (agent) {
        await sendTelegramMessage(
          chatId,
          `Welcome <b>${agent.name}</b>! You are registered as a support agent.\n\n` +
          `Commands:\n` +
          `/available - Mark yourself as available\n` +
          `/busy - Mark yourself as busy\n` +
          `/end - End current chat\n` +
          `/status - Check your status`
        )
      } else {
        await sendTelegramMessage(
          chatId,
          'You are not registered as an agent. Please contact the administrator.'
        )
      }
      return new Response('OK', { status: 200 })
    }

    if (text === '/available') {
      if (agent) {
        await supabase
          .from('telegram_agents')
          .update({ is_available: true, last_active_at: new Date().toISOString() })
          .eq('id', agent.id)
        
        await sendTelegramMessage(chatId, '✅ You are now available for chats')
      }
      return new Response('OK', { status: 200 })
    }

    if (text === '/busy') {
      if (agent) {
        await supabase
          .from('telegram_agents')
          .update({ is_available: false })
          .eq('id', agent.id)
        
        await sendTelegramMessage(chatId, '⏸️ You are now marked as busy')
      }
      return new Response('OK', { status: 200 })
    }

    if (text === '/status') {
      if (agent) {
        const status = agent.is_available ? '✅ Available' : '⏸️ Busy'
        await sendTelegramMessage(
          chatId,
          `<b>Your Status:</b> ${status}\n` +
          `<b>Total Chats:</b> ${agent.total_chats_handled}\n` +
          `<b>Rating:</b> ${agent.rating.toFixed(1)}/5.0`
        )
      }
      return new Response('OK', { status: 200 })
    }

    // Handle regular messages (forward to live chat)
    if (agent?.current_chat_session_id) {
      const { data: session } = await supabase
        .from('live_chat_sessions')
        .select('messages')
        .eq('id', agent.current_chat_session_id)
        .single()

      if (session) {
        const newMessages = [
          ...(session.messages || []),
          {
            sender: 'agent',
            senderName: agent.name,
            message: text,
            timestamp: new Date().toISOString()
          }
        ]

        await supabase
          .from('live_chat_sessions')
          .update({
            messages: newMessages,
            last_message_at: new Date().toISOString()
          })
          .eq('id', agent.current_chat_session_id)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Telegram bot error:', error)
    return new Response('Error', { status: 500 })
  }
})
```

### Setup Webhook

```bash
# Set webhook URL after deploying the function
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=https://<YOUR_PROJECT>.supabase.co/functions/v1/telegram-bot"
```

---

## 3. Cleanup Sessions Cron Job

**File**: `supabase/functions/cleanup-sessions/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

serve(async (req) => {
  try {
    // Verify cron secret (for security)
    const authHeader = req.headers.get('authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Delete sessions older than 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data, error } = await supabase
      .from('live_chat_sessions')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString())

    if (error) throw error

    console.log(`Cleaned up old chat sessions`)

    return new Response(
      JSON.stringify({ success: true, message: 'Cleanup completed' }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Cleanup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

### Schedule with GitHub Actions or External Cron

**File**: `.github/workflows/cron-cleanup.yml`

```yaml
name: Cleanup Old Sessions

on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cleanup Function
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-project.supabase.co/functions/v1/cleanup-sessions
```

---

## 4. Custom JWT Auth Edge Function (Optional)

If you want to keep your custom JWT system:

**File**: `supabase/functions/custom-auth/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const JWT_SECRET = Deno.env.get('JWT_SECRET')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const generateToken = async (userId: string, role: string) => {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  return await create(
    { alg: 'HS256', typ: 'JWT' },
    { sub: userId, role, exp: Date.now() / 1000 + (7 * 24 * 60 * 60) },
    key
  )
}

serve(async (req) => {
  const path = new URL(req.url).pathname

  // Register
  if (path.endsWith('/register') && req.method === 'POST') {
    try {
      const { name, email, password, phone, role, address } = await req.json()

      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        return new Response(
          JSON.stringify({ error: 'User already exists' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password)

      // Create user
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password_hash: passwordHash,
          phone,
          role: role || 'patient',
          address
        })
        .select()
        .single()

      if (error) throw error

      // Generate token
      const token = await generateToken(user.id, user.role)

      return new Response(
        JSON.stringify({ user, token }),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Login
  if (path.endsWith('/login') && req.method === 'POST') {
    try {
      const { email, password } = await req.json()

      // Get user
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.password_hash)

      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid credentials' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Generate token
      const token = await generateToken(user.id, user.role)

      return new Response(
        JSON.stringify({ user, token }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response('Not found', { status: 404 })
})
```

---

## Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy email-notification
supabase functions deploy telegram-bot
supabase functions deploy cleanup-sessions
supabase functions deploy custom-auth

# Set environment secrets
supabase secrets set RESEND_API_KEY=your_key
supabase secrets set TELEGRAM_BOT_TOKEN=your_token
supabase secrets set CRON_SECRET=your_secret
supabase secrets set JWT_SECRET=your_jwt_secret
```

---

## Call Edge Functions from Frontend

```javascript
// Email notification
await supabase.functions.invoke('email-notification', {
  body: {
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Welcome</h1>'
  }
})

// Custom auth
const { data } = await supabase.functions.invoke('custom-auth/login', {
  body: { email, password }
})
```

---

## Testing Locally

```bash
# Start local development
supabase start

# Serve function locally
supabase functions serve email-notification

# Test with curl
curl -X POST http://localhost:54321/functions/v1/email-notification \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
```

---

## Cost Considerations

- **Edge Functions**: 500K invocations/month free
- **Compute**: $2 per 100K invocations after
- **Storage**: 1GB free, $0.021/GB after
- **Bandwidth**: 2GB free, $0.09/GB after

**Estimated Monthly Cost**: $0-5 for small to medium app

---

## Next Steps

1. Deploy all Edge Functions
2. Update frontend to call these functions
3. Test email notifications
4. Setup Telegram webhook
5. Schedule cron jobs
6. Monitor function logs in Supabase Dashboard
