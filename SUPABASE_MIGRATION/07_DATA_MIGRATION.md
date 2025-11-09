# Data Migration Script - MongoDB to Supabase

## Script to migrate existing data from MongoDB to PostgreSQL

---

## Prerequisites

- MongoDB instance accessible
- Supabase project created
- Both database credentials available

---

## Migration Script

**File**: `SUPABASE_MIGRATION/migrate-data.js`

```javascript
const mongoose = require('mongoose')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dhs'

// Supabase Connection
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Import MongoDB models
const User = require('../server/models/User')
const Service = require('../server/models/Service')
const Booking = require('../server/models/Booking')
const Payment = require('../server/models/Payment')
const Notification = require('../server/models/Notification')
const SupportTicket = require('../server/models/SupportTicket')
const Feedback = require('../server/models/Feedback')
const LiveChatSession = require('../server/models/LiveChatSession')
const ChatbotResponse = require('../server/models/ChatbotResponse')
const TelegramAgent = require('../server/models/TelegramAgent')
const TelegramBotConfig = require('../server/models/TelegramBotConfig')
const PageContent = require('../server/models/PageContent')

// Helper: Map MongoDB ID to Supabase UUID
const idMap = {
  users: new Map(),
  services: new Map(),
  bookings: new Map(),
  telegram_agents: new Map()
}

// Connect to MongoDB
async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ Connected to MongoDB')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

// 1. Migrate Users
async function migrateUsers() {
  console.log('\n📦 Migrating Users...')
  
  try {
    const users = await User.find()
    console.log(`Found ${users.length} users`)

    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          email: user.email,
          password_hash: user.password,
          phone: user.phone,
          role: user.role,
          permissions: user.permissions || {},
          address: user.address || {},
          staff_type: user.staffType || null,
          is_verified: user.isVerified || false,
          verification_status: user.verificationStatus || 'pending',
          rejection_reason: user.rejectionReason || null,
          specialization: user.specialization || null,
          experience: user.experience || null,
          qualifications: user.qualifications || null,
          availability: user.availability || 'offline',
          documents: user.documents || [],
          rating: user.rating || 0,
          total_ratings: user.totalRatings || 0,
          profile_picture: user.profilePicture || '/uploads/default-avatar.png',
          created_at: user.createdAt
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error.message)
      } else {
        idMap.users.set(user._id.toString(), data.id)
        console.log(`✅ Migrated user: ${user.email}`)
      }
    }

    console.log(`✅ Users migration complete: ${idMap.users.size}/${users.length}`)
  } catch (error) {
    console.error('❌ Users migration error:', error)
  }
}

// 2. Migrate Services
async function migrateServices() {
  console.log('\n📦 Migrating Services...')
  
  try {
    const services = await Service.find()
    console.log(`Found ${services.length} services`)

    for (const service of services) {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          duration: service.duration || 'One-time',
          image: service.image || '/images/default-service.jpg',
          is_available: service.isAvailable !== false,
          requirements: service.requirements || [],
          features: service.features || [],
          created_at: service.createdAt,
          updated_at: service.updatedAt
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error migrating service ${service.name}:`, error.message)
      } else {
        idMap.services.set(service._id.toString(), data.id)
        console.log(`✅ Migrated service: ${service.name}`)
      }
    }

    console.log(`✅ Services migration complete: ${idMap.services.size}/${services.length}`)
  } catch (error) {
    console.error('❌ Services migration error:', error)
  }
}

// 3. Migrate Bookings
async function migrateBookings() {
  console.log('\n📦 Migrating Bookings...')
  
  try {
    const bookings = await Booking.find()
    console.log(`Found ${bookings.length} bookings`)

    for (const booking of bookings) {
      const patientId = idMap.users.get(booking.patient.toString())
      const serviceId = idMap.services.get(booking.service.toString())
      const staffId = booking.staff ? idMap.users.get(booking.staff.toString()) : null

      if (!patientId || !serviceId) {
        console.log(`⚠️ Skipping booking - missing references`)
        continue
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          patient_id: patientId,
          service_id: serviceId,
          staff_id: staffId,
          scheduled_date: booking.scheduledDate,
          scheduled_time: booking.scheduledTime,
          address: booking.address,
          prescription: booking.prescription || null,
          notes: booking.notes || null,
          status: booking.status,
          feedback: booking.feedback || null,
          completed_at: booking.completedAt || null,
          created_at: booking.createdAt,
          updated_at: booking.updatedAt
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error migrating booking:`, error.message)
      } else {
        idMap.bookings.set(booking._id.toString(), data.id)
        console.log(`✅ Migrated booking: ${data.id}`)
      }
    }

    console.log(`✅ Bookings migration complete: ${idMap.bookings.size}/${bookings.length}`)
  } catch (error) {
    console.error('❌ Bookings migration error:', error)
  }
}

// 4. Migrate Payments
async function migratePayments() {
  console.log('\n📦 Migrating Payments...')
  
  try {
    const payments = await Payment.find()
    console.log(`Found ${payments.length} payments`)

    for (const payment of payments) {
      const bookingId = idMap.bookings.get(payment.booking.toString())
      const userId = idMap.users.get(payment.user.toString())

      if (!bookingId || !userId) {
        console.log(`⚠️ Skipping payment - missing references`)
        continue
      }

      const { error } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingId,
          user_id: userId,
          amount: payment.amount,
          method: payment.method,
          transaction_id: payment.transactionId,
          status: payment.status,
          payment_details: payment.paymentDetails || {},
          created_at: payment.createdAt,
          completed_at: payment.completedAt
        })

      if (error) {
        console.error(`❌ Error migrating payment:`, error.message)
      } else {
        console.log(`✅ Migrated payment: ${payment.transactionId}`)
      }
    }

    console.log(`✅ Payments migration complete`)
  } catch (error) {
    console.error('❌ Payments migration error:', error)
  }
}

// 5. Migrate Notifications
async function migrateNotifications() {
  console.log('\n📦 Migrating Notifications...')
  
  try {
    const notifications = await Notification.find()
    console.log(`Found ${notifications.length} notifications`)

    for (const notification of notifications) {
      const userId = idMap.users.get(notification.user.toString())

      if (!userId) {
        console.log(`⚠️ Skipping notification - user not found`)
        continue
      }

      let relatedId = null
      let relatedModel = notification.relatedModel

      if (notification.relatedId && notification.relatedModel) {
        if (notification.relatedModel === 'Booking') {
          relatedId = idMap.bookings.get(notification.relatedId.toString())
          relatedModel = 'bookings'
        } else if (notification.relatedModel === 'Service') {
          relatedId = idMap.services.get(notification.relatedId.toString())
          relatedModel = 'services'
        } else if (notification.relatedModel === 'User') {
          relatedId = idMap.users.get(notification.relatedId.toString())
          relatedModel = 'users'
        }
      }

      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          related_id: relatedId,
          related_model: relatedModel,
          is_read: notification.isRead,
          created_at: notification.createdAt
        })

      if (error) {
        console.error(`❌ Error migrating notification:`, error.message)
      } else {
        console.log(`✅ Migrated notification`)
      }
    }

    console.log(`✅ Notifications migration complete`)
  } catch (error) {
    console.error('❌ Notifications migration error:', error)
  }
}

// 6. Migrate Support Tickets
async function migrateSupportTickets() {
  console.log('\n📦 Migrating Support Tickets...')
  
  try {
    const tickets = await SupportTicket.find()
    console.log(`Found ${tickets.length} support tickets`)

    for (const ticket of tickets) {
      const userId = idMap.users.get(ticket.user.toString())
      const assignedTo = ticket.assignedTo ? idMap.users.get(ticket.assignedTo.toString()) : null

      if (!userId) {
        console.log(`⚠️ Skipping ticket - user not found`)
        continue
      }

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: ticket.ticketNumber,
          user_id: userId,
          subject: ticket.subject,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          assigned_to: assignedTo,
          messages: ticket.messages || [],
          last_response_at: ticket.lastResponseAt,
          last_response_by: ticket.lastResponseBy,
          resolved_at: ticket.resolvedAt,
          closed_at: ticket.closedAt,
          rating: ticket.rating,
          feedback: ticket.feedback,
          created_at: ticket.createdAt,
          updated_at: ticket.updatedAt
        })

      if (error) {
        console.error(`❌ Error migrating ticket:`, error.message)
      } else {
        console.log(`✅ Migrated ticket: ${ticket.ticketNumber}`)
      }
    }

    console.log(`✅ Support tickets migration complete`)
  } catch (error) {
    console.error('❌ Support tickets migration error:', error)
  }
}

// 7. Migrate Feedback
async function migrateFeedback() {
  console.log('\n📦 Migrating Feedback...')
  
  try {
    const feedbacks = await Feedback.find()
    console.log(`Found ${feedbacks.length} feedback entries`)

    for (const feedback of feedbacks) {
      const bookingId = idMap.bookings.get(feedback.booking.toString())
      const userId = idMap.users.get(feedback.user.toString())
      const serviceId = idMap.services.get(feedback.service.toString())
      const staffId = feedback.staff ? idMap.users.get(feedback.staff.toString()) : null

      if (!bookingId || !userId || !serviceId) {
        console.log(`⚠️ Skipping feedback - missing references`)
        continue
      }

      const { error } = await supabase
        .from('feedback')
        .insert({
          booking_id: bookingId,
          user_id: userId,
          service_id: serviceId,
          staff_id: staffId,
          rating: feedback.rating,
          comment: feedback.comment,
          is_public: feedback.isPublic !== false,
          created_at: feedback.createdAt
        })

      if (error) {
        console.error(`❌ Error migrating feedback:`, error.message)
      } else {
        console.log(`✅ Migrated feedback`)
      }
    }

    console.log(`✅ Feedback migration complete`)
  } catch (error) {
    console.error('❌ Feedback migration error:', error)
  }
}

// 8. Migrate Chatbot Responses
async function migrateChatbotResponses() {
  console.log('\n📦 Migrating Chatbot Responses...')
  
  try {
    const responses = await ChatbotResponse.find()
    console.log(`Found ${responses.length} chatbot responses`)

    for (const response of responses) {
      const { error } = await supabase
        .from('chatbot_responses')
        .insert({
          intent: response.intent,
          keywords: response.keywords || [],
          response: response.response,
          follow_up_options: response.followUpOptions || [],
          category: response.category,
          is_active: response.isActive !== false,
          priority: response.priority || 0,
          created_at: response.createdAt,
          updated_at: response.updatedAt
        })

      if (error) {
        console.error(`❌ Error migrating chatbot response:`, error.message)
      } else {
        console.log(`✅ Migrated chatbot response: ${response.intent}`)
      }
    }

    console.log(`✅ Chatbot responses migration complete`)
  } catch (error) {
    console.error('❌ Chatbot responses migration error:', error)
  }
}

// 9. Migrate Telegram Agents
async function migrateTelegramAgents() {
  console.log('\n📦 Migrating Telegram Agents...')
  
  try {
    const agents = await TelegramAgent.find()
    console.log(`Found ${agents.length} telegram agents`)

    for (const agent of agents) {
      const { data, error } = await supabase
        .from('telegram_agents')
        .insert({
          name: agent.name,
          telegram_user_id: agent.telegramUserId,
          telegram_username: agent.telegramUsername,
          is_active: agent.isActive !== false,
          is_available: agent.isAvailable || false,
          total_chats_handled: agent.totalChatsHandled || 0,
          average_response_time: agent.averageResponseTime || 0,
          rating: agent.rating || 0,
          last_active_at: agent.lastActiveAt,
          created_at: agent.createdAt,
          updated_at: agent.updatedAt
        })
        .select()
        .single()

      if (error) {
        console.error(`❌ Error migrating agent:`, error.message)
      } else {
        idMap.telegram_agents.set(agent._id.toString(), data.id)
        console.log(`✅ Migrated agent: ${agent.name}`)
      }
    }

    console.log(`✅ Telegram agents migration complete`)
  } catch (error) {
    console.error('❌ Telegram agents migration error:', error)
  }
}

// 10. Migrate Telegram Bot Config
async function migrateTelegramBotConfig() {
  console.log('\n📦 Migrating Telegram Bot Config...')
  
  try {
    const config = await TelegramBotConfig.findOne()
    
    if (!config) {
      console.log('No bot config found')
      return
    }

    const { error } = await supabase
      .from('telegram_bot_config')
      .insert({
        bot_token: config.botToken,
        bot_username: config.botUsername,
        is_active: config.isActive || false,
        webhook_url: config.webhookUrl,
        inactivity_timeout: config.inactivityTimeout || 5,
        auto_response_enabled: config.autoResponseEnabled !== false,
        welcome_message: config.welcomeMessage,
        offline_message: config.offlineMessage,
        created_at: config.createdAt,
        updated_at: config.updatedAt
      })

    if (error) {
      console.error(`❌ Error migrating bot config:`, error.message)
    } else {
      console.log(`✅ Migrated bot config`)
    }
  } catch (error) {
    console.error('❌ Bot config migration error:', error)
  }
}

// 11. Migrate Page Content
async function migratePageContent() {
  console.log('\n📦 Migrating Page Content...')
  
  try {
    const pages = await PageContent.find()
    console.log(`Found ${pages.length} pages`)

    for (const page of pages) {
      const { error } = await supabase
        .from('page_content')
        .insert({
          page_type: page.pageType,
          sections: page.sections || [],
          created_at: page.createdAt,
          updated_at: page.updatedAt
        })

      if (error) {
        console.error(`❌ Error migrating page:`, error.message)
      } else {
        console.log(`✅ Migrated page: ${page.pageType}`)
      }
    }

    console.log(`✅ Page content migration complete`)
  } catch (error) {
    console.error('❌ Page content migration error:', error)
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting migration from MongoDB to Supabase...\n')
  
  await connectMongo()
  
  await migrateUsers()
  await migrateServices()
  await migrateBookings()
  await migratePayments()
  await migrateNotifications()
  await migrateSupportTickets()
  await migrateFeedback()
  await migrateChatbotResponses()
  await migrateTelegramAgents()
  await migrateTelegramBotConfig()
  await migratePageContent()
  
  console.log('\n✅ Migration complete!')
  console.log('\n📊 Migration Summary:')
  console.log(`  Users: ${idMap.users.size}`)
  console.log(`  Services: ${idMap.services.size}`)
  console.log(`  Bookings: ${idMap.bookings.size}`)
  console.log(`  Telegram Agents: ${idMap.telegram_agents.size}`)
  
  await mongoose.disconnect()
  console.log('\n👋 Disconnected from MongoDB')
  process.exit(0)
}

// Run migration
migrate().catch(error => {
  console.error('❌ Migration failed:', error)
  process.exit(1)
})
```

---

## Environment Setup

Create `.env` in root:

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/dhs

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Run Migration

```bash
# Install dependencies
npm install @supabase/supabase-js

# Run migration
node SUPABASE_MIGRATION/migrate-data.js
```

---

## Post-Migration Verification

```sql
-- Check row counts
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'support_tickets', COUNT(*) FROM support_tickets
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'chatbot_responses', COUNT(*) FROM chatbot_responses
UNION ALL
SELECT 'telegram_agents', COUNT(*) FROM telegram_agents;
```

---

## Rollback Plan

If migration fails, you can:

1. Drop all data from Supabase tables
2. Fix the issue
3. Re-run migration script

```sql
-- Clear all tables (use with caution!)
TRUNCATE users, services, bookings, payments, notifications, 
         support_tickets, feedback, live_chat_sessions, 
         chatbot_responses, telegram_agents, telegram_bot_config, 
         page_content CASCADE;
```

---

## Important Notes

- **Backup MongoDB** before migration
- **Test on staging** environment first
- Migration preserves timestamps
- Password hashes are copied as-is
- File paths remain the same (migrate files separately if needed)
- MongoDB ObjectIDs are mapped to UUID v4 in PostgreSQL
