# Telegram Bot Integration - Setup Guide

## Overview
The Telegram bot integration allows users to chat with live support agents directly through your website. When users click "Talk to Agent" in the chatbot, they are connected to an available agent on Telegram in real-time.

## Features Implemented

### Backend Features
✅ **Agent Management System**
- Add/edit/delete agents with Telegram user IDs
- Track agent availability status (available/busy)
- Auto-assign users to least busy available agent
- Agent statistics (total chats, response time, ratings)

✅ **Live Chat Sessions**
- Real-time messaging between users and Telegram agents
- Session tracking with unique IDs (CHAT-{timestamp}-{random})
- Message history storage
- Session status tracking (waiting, connected, ended, timeout)

✅ **Inactivity Management**
- Automatic session closure after 5 minutes of inactivity
- Configurable timeout period
- Background checker runs every 60 seconds

✅ **Telegram Bot Commands**
- `/start` - Register with the bot
- `/available` - Mark yourself as available for chats
- `/busy` - Mark yourself as busy (stop receiving new chats)
- `/end` - End current chat session
- `/status` - Check your current status and active session

✅ **Fallback System**
- Check agent availability before connecting
- Redirect to ticket system when no agents available
- Graceful error handling

### Frontend Features
✅ **Admin Panel Pages**
- Bot Configuration page (`/admin/telegram-bot`)
  - Configure bot token and username
  - Set inactivity timeout
  - Customize welcome and offline messages
  - Enable/disable bot
  - View live stats (total agents, available agents, active chats)

- Agent Management page (`/admin/telegram-agents`)
  - Add new agents with Telegram user IDs
  - Edit agent information
  - Activate/deactivate agents
  - View agent statistics
  - Delete agents

✅ **Enhanced Chatbot**
- Dual-mode support (AI bot + Live agent)
- Automatic agent availability check
- Real-time message polling (every 3 seconds)
- Display connected agent name
- End chat button for users
- Auto-reconnect to bot mode when session ends
- System messages for status updates

## Setup Instructions

### Step 1: Create Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow instructions to name your bot
4. Copy the **bot token** (format: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
5. Copy the **bot username** (format: `your_bot_name_bot`)

### Step 2: Configure Bot in Admin Panel

1. Login to admin panel
2. Navigate to **Telegram Bot** from dashboard
3. Enter the bot token and username
4. Configure settings:
   - Inactivity Timeout (default: 5 minutes)
   - Welcome Message
   - Offline Message
5. Check "Enable Telegram Bot"
6. Click **Save Configuration**

### Step 3: Add Support Agents

1. Navigate to **Support Agents** from dashboard
2. Click **Add Agent**
3. For each agent:
   
   **Get Telegram User ID:**
   - Ask agent to open Telegram
   - Search for `@userinfobot`
   - Send `/start` to the bot
   - Copy the User ID shown (e.g., `123456789`)
   
   **Register Agent:**
   - Enter agent name (e.g., "John Doe")
   - Enter Telegram User ID
   - Enter Telegram username (optional, e.g., "johndoe")
   - Click **Add Agent**

4. Agent will be added but marked as "Inactive"

### Step 4: Activate Agents

1. Ask each agent to:
   - Open Telegram
   - Search for your bot username (e.g., `@your_bot_name_bot`)
   - Send `/start` command to the bot
   - Bot will reply with welcome message
   - Send `/available` command to start accepting chats
   - Agent status will change to "Available"

### Step 5: Test the System

1. Open your website in a browser
2. Click the chatbot icon (bottom right)
3. Type "talk to agent" or click any "Chat with Agent" button
4. If agents are available:
   - You'll see "Connecting..." message
   - Bot will show "Connected to [Agent Name]"
   - Agent receives notification on Telegram
5. Start chatting!
   - Your messages appear on agent's Telegram
   - Agent's replies appear in your chat popup
6. To end chat:
   - Click "End Chat" button in chatbot, OR
   - Agent sends `/end` command on Telegram

## Agent Telegram Commands Reference

```
/start       - Register with the bot and get welcome message
/available   - Mark yourself as available to receive chat requests
/busy        - Mark yourself as busy (stop receiving new chats)
/end         - End your current chat session
/status      - Check your current availability and active session
```

## How It Works

### User-Side Flow:
1. User clicks chatbot → Types query → AI bot responds
2. User asks to talk to agent → Bot checks availability
3. If agent available → Create live chat session
4. User's messages sent to Telegram agent
5. Agent's Telegram replies appear in user's chatbot
6. Either party can end session
7. After 5 minutes of inactivity → Auto-close session

### Agent-Side Flow:
1. Agent sends `/start` to register with bot
2. Agent sends `/available` to accept chats
3. Bot sends notification: "New chat from [User Name]"
4. Agent types message → Sent to user's chatbot
5. User's messages appear on agent's Telegram
6. Agent sends `/end` to close chat
7. Agent sends `/busy` to stop receiving new chats

### Session Management:
- Session ID format: `CHAT-1234567890-abcd1234`
- Status tracking: `waiting` → `connected` → `ended`/`timeout`
- Message history stored in database
- Inactivity checker runs every 60 seconds
- Auto-close after 5 minutes (configurable)

## API Endpoints

### Public Endpoints
- `GET /api/telegram/availability` - Check if any agents are available

### User Endpoints (Requires Authentication)
- `POST /api/telegram/connect` - Connect to available agent
- `POST /api/telegram/message/:sessionId` - Send message to agent
- `GET /api/telegram/session/:sessionId` - Get session details
- `POST /api/telegram/end/:sessionId` - End chat session
- `GET /api/telegram/sessions` - Get user's chat history

### Admin Endpoints (Requires Admin Role)
- `GET /api/telegram/config` - Get bot configuration
- `PUT /api/telegram/config` - Update bot configuration
- `GET /api/telegram/agents` - Get all agents
- `POST /api/telegram/agents` - Add new agent
- `PUT /api/telegram/agents/:id` - Update agent
- `DELETE /api/telegram/agents/:id` - Delete agent
- `GET /api/telegram/sessions/all` - Get all chat sessions

## Database Models

### TelegramBotConfig
```javascript
{
  botToken: String,
  botUsername: String,
  isActive: Boolean,
  inactivityTimeout: Number (minutes),
  welcomeMessage: String,
  offlineMessage: String
}
```

### TelegramAgent
```javascript
{
  name: String,
  telegramUserId: String (unique),
  telegramUsername: String,
  isActive: Boolean,
  isAvailable: Boolean,
  currentChatSession: ObjectId (LiveChatSession),
  totalChatsHandled: Number,
  averageResponseTime: Number (seconds),
  rating: Number (1-5),
  lastActiveAt: Date
}
```

### LiveChatSession
```javascript
{
  sessionId: String (auto-generated),
  user: ObjectId (User),
  agent: ObjectId (TelegramAgent),
  status: Enum ['waiting', 'connected', 'ended', 'timeout'],
  messages: [{
    sender: Enum ['user', 'agent'],
    senderName: String,
    message: String,
    timestamp: Date
  }],
  startedAt: Date,
  endedAt: Date,
  lastMessageAt: Date
}
```

## Troubleshooting

### Issue: Bot not responding to commands
**Solution:** 
- Check if bot token is correct in admin panel
- Verify bot is enabled (isActive = true)
- Check backend console for errors
- Restart backend server

### Issue: Agent not receiving chat requests
**Solution:**
- Verify agent sent `/start` to bot
- Check if agent status is "Available" (send `/available`)
- Confirm agent is marked as "Active" in admin panel
- Check Telegram User ID is correct

### Issue: Messages not appearing in real-time
**Solution:**
- Frontend polls every 3 seconds (normal slight delay)
- Check browser console for errors
- Verify session ID is valid
- Check if session status is "connected"

### Issue: Sessions auto-closing too quickly
**Solution:**
- Increase inactivity timeout in admin panel
- Default is 5 minutes
- Can be set up to 60 minutes

### Issue: Can't connect to agent (all busy)
**Solution:**
- Check if any agents are marked as "Available"
- Ask agents to send `/available` command
- Add more agents in admin panel
- User will see ticket creation option

## Files Created/Modified

### Backend Files:
- `server/models/TelegramAgent.js` - Agent model
- `server/models/LiveChatSession.js` - Session model
- `server/models/TelegramBotConfig.js` - Config model
- `server/utils/telegramBotService.js` - Main bot service (400+ lines)
- `server/controllers/telegramController.js` - API controllers
- `server/routes/telegramRoutes.js` - API routes
- `server/server.js` - Added bot initialization

### Frontend Files:
- `client/src/pages/admin/ManageTelegramBot.jsx` - Bot config page
- `client/src/pages/admin/ManageTelegramAgents.jsx` - Agent management page
- `client/src/components/Chatbot.jsx` - Enhanced with Telegram integration
- `client/src/pages/admin/AdminDashboard.jsx` - Added Telegram links
- `client/src/App.jsx` - Added Telegram routes

## Next Steps

1. **Create bot via BotFather** (Step 1 above)
2. **Configure bot in admin panel** (Step 2 above)
3. **Add your first agent** (Step 3 above)
4. **Test the system** (Step 5 above)
5. **Train agents** on Telegram commands
6. **Monitor sessions** in admin panel
7. **Collect feedback** from users and agents

## Additional Features (Future Enhancements)

- [ ] WebSocket for real-time updates (instead of polling)
- [ ] Agent chat history view in admin panel
- [ ] Session transcripts export
- [ ] Agent performance analytics dashboard
- [ ] Canned responses for agents
- [ ] File/image sharing support
- [ ] Multi-language support
- [ ] User satisfaction ratings
- [ ] Agent workload balancing
- [ ] Chat queue when all agents busy

## Support

For issues or questions:
1. Check this documentation first
2. Review backend console logs
3. Check browser console for frontend errors
4. Verify all setup steps completed
5. Test with a fresh Telegram account

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
