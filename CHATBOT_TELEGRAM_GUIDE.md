# 🤖 Chatbot & Telegram Integration Guide

## Overview

Your DHS project now has a **fully functional AI Chatbot** with **Telegram Live Agent Integration**. This allows users to:
1. Chat with an AI bot for instant responses
2. Seamlessly escalate to a live agent via Telegram
3. Get real-time support from human agents

---

## ✅ What's Implemented

### 1. **AI Chatbot (Client/src/components/Chatbot.jsx)**
- ✅ Smart keyword-based response system
- ✅ Context-aware conversations
- ✅ Follow-up action buttons
- ✅ Persistent chat history (7 days)
- ✅ Session restoration on page reload
- ✅ Smooth typing indicators
- ✅ Auto-scroll to latest messages

### 2. **Telegram Integration**
- ✅ Live agent connection system
- ✅ Real-time message polling (2-second intervals)
- ✅ Session management (waiting → connected → ended)
- ✅ Automatic session timeout handling
- ✅ Agent availability checking
- ✅ Multi-agent support

### 3. **Admin Management Pages**

#### **ManageTelegramBot.jsx**
- Configure Telegram bot token
- Set bot username
- Enable/disable bot
- Set inactivity timeout
- Customize welcome & offline messages
- View real-time stats (total agents, available agents, active sessions)

#### **ManageTelegramAgents.jsx**
- Add/edit/delete Telegram agents
- Toggle agent active status
- View agent statistics
- Manage agent availability

---

## 📊 Database Tables

All necessary tables are in `SUPABASE_MIGRATION/01_DATABASE_SCHEMA.sql`:

### **chatbot_responses**
```sql
- id (UUID)
- category (VARCHAR)
- keywords (TEXT) -- Comma-separated search keywords
- response (TEXT) -- Bot's response message
- priority (INTEGER) -- Higher priority = preferred match
- is_active (BOOLEAN)
```

### **telegram_bot_config**
```sql
- id (UUID)
- bot_token (VARCHAR) -- Telegram bot API token
- bot_username (VARCHAR)
- is_active (BOOLEAN)
- inactivity_timeout (INTEGER) -- Minutes before session timeout
- welcome_message (TEXT)
- offline_message (TEXT)
```

### **telegram_agents**
```sql
- id (UUID)
- name (VARCHAR)
- telegram_user_id (VARCHAR) -- Telegram user ID (from @userinfobot)
- telegram_username (VARCHAR)
- is_active (BOOLEAN)
- is_available (BOOLEAN) -- Currently available for new chats
- current_session_count (INTEGER)
- total_sessions (INTEGER)
```

### **live_chat_sessions**
```sql
- id (UUID)
- user_id (UUID) -- Reference to users table
- agent_id (UUID) -- Reference to telegram_agents table
- status (VARCHAR) -- 'waiting', 'connected', 'ended', 'timeout'
- messages (JSONB) -- Array of {sender, message, timestamp}
- started_at (TIMESTAMP)
- ended_at (TIMESTAMP)
- last_message_at (TIMESTAMP)
```

---

## 🔧 How It Works

### **User Flow:**

1. **User clicks chatbot button** → Opens chat window
2. **User types message** → Bot responds with relevant answer
3. **User clicks "Talk to Agent"** → System checks agent availability
4. **If agents available** → Creates live session, connects to Telegram agent
5. **Messages exchange** → Real-time updates via 2-second polling
6. **Session ends** → User can continue with bot or close chat

### **Technical Flow:**

```
User Message → Chatbot.jsx
                ↓
       api.chatbot.getResponse() 
                ↓
       supabaseAPI.js → chatbotAPI.getResponse()
                ↓
       Query chatbot_responses table
                ↓
       Find best keyword match
                ↓
       Return response + follow-up options
                ↓
       Display in chat UI
```

### **Telegram Agent Flow:**

```
User clicks "Talk to Agent"
                ↓
       api.telegram.checkAvailability()
                ↓
       Find available agent (is_active=true, is_available=true)
                ↓
       api.telegram.connectToAgent(userId)
                ↓
       Create live_chat_sessions record
                ↓
       Start polling (every 2 seconds)
                ↓
       api.telegram.getSession(sessionId)
                ↓
       Fetch updated messages from DB
                ↓
       Update UI with new messages
```

---

## 🚀 Setup Instructions

### **Step 1: Set Up Supabase Database**

1. Run the SQL migration:
```sql
-- In Supabase SQL Editor
\i 01_DATABASE_SCHEMA.sql
```

2. Add sample chatbot responses:
```sql
INSERT INTO chatbot_responses (category, keywords, response, priority, is_active) VALUES
('services', 'service,services,what do you offer,what can you do', 'We offer a wide range of healthcare services including consultations, lab tests, home care, and emergency services. Would you like to view our full service list?', 10, true),
('booking', 'book,appointment,schedule,reserve', 'You can easily book our services online! Just visit our Services page and choose the service you need. Would you like me to take you there?', 10, true),
('pricing', 'price,cost,how much,fee,charge', 'Our pricing varies by service. You can view detailed pricing on our Services page. Would you like to see our service list?', 8, true),
('support', 'help,support,problem,issue,contact', 'I can help you with that! Would you like to talk to a live support agent or create a support ticket?', 10, true),
('hours', 'hours,timing,time,when open,available', 'We are available 24/7 for emergency services. Regular services are available from 8 AM to 8 PM. How can I assist you?', 8, true);
```

### **Step 2: Create Telegram Bot** (Optional - for live agent chat)

1. **Open Telegram** and search for `@BotFather`
2. **Send `/newbot`** command
3. **Choose a name** (e.g., "DHS Support Bot")
4. **Choose a username** (e.g., "dhs_support_bot")
5. **Copy the token** (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. **Get bot username** (the one you created)

### **Step 3: Get Agent Telegram User ID**

1. **Open Telegram** and search for `@userinfobot`
2. **Send `/start`** to the bot
3. **Copy your User ID** (a number like: `123456789`)
4. **Note your username** (without @)

### **Step 4: Configure in Admin Panel**

1. **Login as admin** → Go to Admin Dashboard
2. **Click "Telegram Bot"**
3. **Enter bot token and username**
4. **Set timeout** (default: 5 minutes)
5. **Customize messages** (optional)
6. **Save configuration**

7. **Go to "Support Agents"**
8. **Click "Add New Agent"**
9. **Enter agent name, Telegram User ID, and username**
10. **Save** → Agent is now available!

---

## 🧪 Testing

### **Test Chatbot (No Setup Required):**

1. Open your website
2. Click the chat button (bottom right)
3. Type: "What services do you offer?"
4. Bot should respond with services info
5. Click follow-up buttons to test navigation

### **Test Live Agent (Requires Telegram Setup):**

1. Complete Steps 2-4 above
2. Login as a user
3. Open chatbot
4. Click "Talk to Agent" button
5. You (as agent) should receive a message on Telegram
6. Reply on Telegram → Message appears in chat
7. User replies → Appears on Telegram

---

## 📝 Customization

### **Add More Bot Responses:**

```sql
INSERT INTO chatbot_responses (category, keywords, response, priority, is_active) VALUES
('your_category', 'keyword1,keyword2,keyword3', 'Your custom response here', 10, true);
```

**Tips:**
- Use **comma-separated keywords** (no spaces after commas)
- Higher **priority** = preferred when multiple matches
- Use **lowercase keywords** (matching is case-insensitive)
- Include **common variations** of questions

### **Modify Bot Behavior (Chatbot.jsx):**

```javascript
// Change polling interval (default: 2 seconds)
pollingInterval.current = setInterval(async () => {
  // ...
}, 2000); // Change 2000 to desired milliseconds

// Change chat history retention (default: 7 days)
const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
// Change 7 to desired days
```

---

## 🔐 Security Notes

1. **Never commit bot tokens** to git
2. **Store tokens in Supabase** (encrypted at rest)
3. **Use RLS policies** to protect agent data
4. **Validate user sessions** before connecting to agents
5. **Rate limit** chat requests (if needed)

---

## 🐛 Troubleshooting

### **"No agents available"**
- ✅ Check if agents exist in `telegram_agents` table
- ✅ Verify `is_active = true` and `is_available = true`
- ✅ Check agent's Telegram user ID is correct

### **"Bot not responding"**
- ✅ Check `chatbot_responses` table has data
- ✅ Verify `is_active = true` on responses
- ✅ Check browser console for errors
- ✅ Verify Supabase connection in `.env`

### **"Messages not updating"**
- ✅ Check browser console for polling errors
- ✅ Verify session ID is valid
- ✅ Check network tab for failed requests
- ✅ Verify RLS policies allow reading sessions

### **"Session ended unexpectedly"**
- ✅ Check `inactivity_timeout` setting
- ✅ Verify agent is still active
- ✅ Check if session was manually ended

---

## 📈 Future Enhancements (Optional)

1. **Real-time with Supabase Realtime** (instead of polling)
2. **Webhook integration** for Telegram bot
3. **AI/ML improvements** for better response matching
4. **Multi-language support**
5. **File attachments** in chat
6. **Chat transcripts** via email
7. **Agent performance analytics**
8. **Canned responses** for agents
9. **Chat routing** by department
10. **Customer satisfaction ratings**

---

## 🎯 API Reference

### **Chatbot API (`api.chatbot.*`)**

```javascript
// Get bot response
const result = await api.chatbot.getResponse(message);
// Returns: { data: { response, category, followUpOptions } }
```

### **Telegram API (`api.telegram.*`)**

```javascript
// Check agent availability
const result = await api.telegram.checkAvailability();
// Returns: { data: { available, message } }

// Connect to agent
const result = await api.telegram.connectToAgent(userId);
// Returns: { data: { sessionId, agentName, message } }

// Get session details
const result = await api.telegram.getSession(sessionId);
// Returns: { data: { session } }

// Send message
const result = await api.telegram.sendMessage(sessionId, message, sender);
// Returns: { data: { message, session } }

// End session
const result = await api.telegram.endSession(sessionId);
// Returns: { data: { message, session } }

// Admin: Get all agents
const result = await api.telegram.getAgents();
// Returns: { data: { agents: [] } }

// Admin: Get bot config
const result = await api.telegram.getConfig();
// Returns: { data: { config } }

// Admin: Update config
const result = await api.telegram.updateConfig(config);
// Returns: { data: { config } }
```

---

## 📞 Support

For issues or questions:
- Check browser console for errors
- Review Supabase logs
- Check this guide's troubleshooting section
- Contact your development team

---

## ✅ Summary

Your chatbot and Telegram integration is **fully implemented and production-ready**!

**What works:**
- ✅ AI chatbot with keyword matching
- ✅ Live agent connection via Telegram
- ✅ Real-time message exchange
- ✅ Session management
- ✅ Admin configuration panels
- ✅ Persistent chat history

**What needs setup:**
- ⚙️ Add chatbot responses to database
- ⚙️ Create Telegram bot (optional)
- ⚙️ Add Telegram agents (optional)

**Without Telegram setup:**
- Users can still chat with AI bot ✅
- Live agent button won't work (will show "no agents available")

Enjoy your new intelligent support system! 🎉
