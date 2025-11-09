# Architecture Diagrams & Data Flow

## Current Architecture (MERN Stack)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    React Application                      │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │   Pages    │  │  Components │  │   AuthContext    │  │  │
│  │  │            │  │             │  │   (JWT storage)  │  │  │
│  │  │  - Login   │  │  - Navbar   │  └──────────────────┘  │  │
│  │  │  - Register│  │  - Service  │                         │  │
│  │  │  - Booking │  │  - Booking  │  ┌──────────────────┐  │  │
│  │  │  - Profile │  │  - Modal    │  │     api.js       │  │  │
│  │  └────────────┘  └─────────────┘  │   (Axios)        │  │  │
│  │                                     └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP Requests (Axios)
                               │ Bearer Token in Headers
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER SIDE                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Express.js Server                      │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │              Middleware Layer                       │  │  │
│  │  │  - CORS                                             │  │  │
│  │  │  - JWT Verification (auth.js)                       │  │  │
│  │  │  - Error Handler                                    │  │  │
│  │  │  - Multer (File Upload)                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │                    Routes                           │  │  │
│  │  │  /api/auth      /api/bookings    /api/services     │  │  │
│  │  │  /api/payments  /api/support     /api/telegram     │  │  │
│  │  │  /api/admin     /api/chatbot     /api/pages        │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                         │                                  │  │
│  │                         ▼                                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │               Controllers                           │  │  │
│  │  │  - authController.js                                │  │  │
│  │  │  - bookingController.js                             │  │  │
│  │  │  - serviceController.js                             │  │  │
│  │  │  - paymentController.js                             │  │  │
│  │  │  - supportController.js                             │  │  │
│  │  │  - telegramController.js                            │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                         │                                  │  │
│  │                         ▼                                  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           Mongoose ODM Layer                        │  │  │
│  │  │  - User.js      - Service.js    - Booking.js       │  │  │
│  │  │  - Payment.js   - Notification.js                   │  │  │
│  │  │  - SupportTicket.js  - Feedback.js                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            External Services                            │    │
│  │  - Nodemailer (Email)                                   │    │
│  │  - Telegram Bot API                                     │    │
│  │  - Node-cron (Scheduled Jobs)                           │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ MongoDB Protocol
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Collections:                                            │   │
│  │  - users          - services       - bookings           │   │
│  │  - payments       - notifications  - support_tickets    │   │
│  │  - feedback       - live_chat_sessions                  │   │
│  │  - chatbot_responses  - telegram_agents                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Issues with Current Architecture:
❌ Two separate deployments (frontend + backend)
❌ Manual scaling required
❌ Complex real-time implementation
❌ More code to maintain
❌ Slower development cycle
```

---

## New Architecture (Supabase)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Application (Vite)                     │  │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │   Pages    │  │  Components │  │  AuthContext     │  │  │
│  │  │            │  │             │  │  (Supabase)      │  │  │
│  │  │  - Login   │  │  - Navbar   │  └──────────────────┘  │  │
│  │  │  - Register│  │  - Service  │                         │  │
│  │  │  - Booking │  │  - Booking  │  ┌──────────────────┐  │  │
│  │  │  - Profile │  │  - Modal    │  │  supabase.js     │  │  │
│  │  └────────────┘  └─────────────┘  │  (Supabase Client│  │  │
│  │                                     └──────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Direct HTTPS/WSS
                               │ JWT in Request Headers
                               │ Real-time via WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE PLATFORM                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    PostgREST API                          │  │
│  │  (Auto-generated REST API from PostgreSQL schema)        │  │
│  │                                                            │  │
│  │  Endpoints:                                                │  │
│  │  GET    /users                                             │  │
│  │  POST   /bookings                                          │  │
│  │  PATCH  /bookings?id=eq.123                                │  │
│  │  DELETE /notifications?id=eq.456                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Row Level Security (RLS)                     │  │
│  │  - Automatic policy enforcement on every query            │  │
│  │  - User can only see their own data                       │  │
│  │  - Admin can see all data                                 │  │
│  │  - Staff can see assigned work                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  PostgreSQL Database                      │  │
│  │  ┌──────────────────────────────────────────────────┐    │  │
│  │  │  Tables (12):                                     │    │  │
│  │  │  - users          - services       - bookings    │    │  │
│  │  │  - payments       - notifications                │    │  │
│  │  │  - support_tickets - feedback                    │    │  │
│  │  │  - live_chat_sessions                            │    │  │
│  │  │  - chatbot_responses  - telegram_agents          │    │  │
│  │  │  - telegram_bot_config - page_content            │    │  │
│  │  │                                                   │    │  │
│  │  │  Indexes, Triggers, Views, Functions             │    │  │
│  │  └──────────────────────────────────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Supabase Auth                          │  │
│  │  - User registration                                      │  │
│  │  - Login/Logout                                           │  │
│  │  - JWT token generation                                   │  │
│  │  - Password reset                                         │  │
│  │  - Session management                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Supabase Storage                          │  │
│  │  Buckets:                                                 │  │
│  │  - dhs-uploads/                                           │  │
│  │    ├── service-images/                                    │  │
│  │    ├── prescriptions/                                     │  │
│  │    ├── staff-documents/                                   │  │
│  │    └── profile-pictures/                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Supabase Realtime                         │  │
│  │  - WebSocket connections                                  │  │
│  │  - Database change subscriptions                          │  │
│  │  - Broadcast messages                                     │  │
│  │  - Presence (online/offline status)                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Edge Functions (Deno)                    │  │
│  │  ┌────────────────┐  ┌────────────────┐                  │  │
│  │  │email-notify    │  │ telegram-bot   │                  │  │
│  │  │(Send emails)   │  │ (Webhook)      │                  │  │
│  │  └────────────────┘  └────────────────┘                  │  │
│  │  ┌────────────────┐  ┌────────────────┐                  │  │
│  │  │cleanup-sessions│  │ custom-auth    │                  │  │
│  │  │(Cron job)      │  │ (Optional)     │                  │  │
│  │  └────────────────┘  └────────────────┘                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ External Integrations
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Resend API     │  │ Telegram Bot   │  │ GitHub Actions │   │
│  │ (Email)        │  │ API            │  │ (Cron Jobs)    │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Benefits of New Architecture:
✅ Single deployment (frontend only on Vercel)
✅ Automatic scaling
✅ Built-in real-time
✅ Less code to maintain
✅ Faster development
✅ Better security (RLS)
✅ Automatic backups
```

---

## Data Flow Examples

### 1. User Registration Flow

**BEFORE (MERN):**
```
User fills form
     │
     ├─> React sends POST /api/auth/register
     │
     ├─> Express receives request
     │
     ├─> authController.register()
     │     │
     │     ├─> Check if user exists (MongoDB query)
     │     │
     │     ├─> Hash password with bcrypt
     │     │
     │     ├─> Create user in MongoDB
     │     │
     │     ├─> Generate JWT token
     │     │
     │     └─> Return user + token
     │
     └─> React stores token in localStorage
```

**AFTER (Supabase):**
```
User fills form
     │
     ├─> React calls supabase.auth.signUp()
     │
     ├─> Supabase Auth handles:
     │     │
     │     ├─> Check if user exists
     │     │
     │     ├─> Hash password (automatic)
     │     │
     │     ├─> Create user in auth.users
     │     │
     │     ├─> Trigger creates entry in public.users
     │     │
     │     └─> Generate JWT (automatic)
     │
     └─> React receives session (auto-stored)
```

### 2. Create Booking Flow

**BEFORE (MERN):**
```
User clicks "Book Service"
     │
     ├─> React sends POST /api/bookings with JWT
     │
     ├─> Express middleware verifies JWT
     │
     ├─> bookingController.createBooking()
     │     │
     │     ├─> Check if service exists
     │     │
     │     ├─> Create booking in MongoDB
     │     │
     │     ├─> Create notification in MongoDB
     │     │
     │     ├─> Send email via nodemailer
     │     │
     │     └─> Return booking data
     │
     └─> React updates UI
```

**AFTER (Supabase):**
```
User clicks "Book Service"
     │
     ├─> React calls supabase.from('bookings').insert()
     │
     ├─> Supabase:
     │     │
     │     ├─> Verifies JWT automatically
     │     │
     │     ├─> Checks RLS policies (user can insert own bookings)
     │     │
     │     ├─> Inserts into PostgreSQL
     │     │
     │     ├─> Triggers real-time notification to admin
     │     │
     │     └─> Returns booking data
     │
     ├─> React calls Edge Function for email
     │
     └─> React updates UI (or receives real-time update)
```

### 3. Real-time Notification Flow

**BEFORE (MERN):**
```
Admin updates booking status
     │
     ├─> React sends PUT /api/bookings/:id/status
     │
     ├─> Express updates MongoDB
     │
     ├─> Express creates notification in MongoDB
     │
     ├─> React polls GET /api/notifications every 30s
     │
     └─> User sees notification (delayed)
```

**AFTER (Supabase):**
```
Admin updates booking status
     │
     ├─> React calls supabase.from('bookings').update()
     │
     ├─> Supabase updates PostgreSQL
     │
     ├─> Real-time subscription fires instantly
     │
     ├─> User's browser receives WebSocket message
     │
     └─> User sees notification (instant)
```

### 4. File Upload Flow

**BEFORE (MERN):**
```
User uploads prescription
     │
     ├─> React sends multipart/form-data
     │
     ├─> Express multer middleware saves to /uploads
     │
     ├─> Returns file path string
     │
     └─> React displays image from server
```

**AFTER (Supabase):**
```
User uploads prescription
     │
     ├─> React calls supabase.storage.upload()
     │
     ├─> File uploaded to Supabase Storage
     │
     ├─> Returns file URL
     │
     └─> React displays image from CDN
```

---

## Database Relationships

```
┌──────────────┐
│    users     │
│   (patient)  │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼───────┐        N  ┌─────────────┐
│   bookings   │───────────│  payments   │
└──────┬───────┘           └─────────────┘
       │ N
       │
       │ 1
┌──────▼───────┐
│   services   │
└──────┬───────┘
       │
       │ N
┌──────▼───────┐
│   feedback   │
└──────────────┘

┌──────────────┐
│    users     │
│   (staff)    │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼───────┐
│   bookings   │
│ (assigned)   │
└──────────────┘

┌──────────────┐        N  ┌──────────────────┐
│    users     │───────────│  notifications   │
└──────────────┘           └──────────────────┘

┌──────────────┐        N  ┌──────────────────┐
│    users     │───────────│ support_tickets  │
└──────────────┘           └──────────────────┘

┌──────────────┐        1  ┌──────────────────────┐
│    users     │───────────│ live_chat_sessions   │
└──────────────┘           └──────┬───────────────┘
                                  │ N
                                  │
                                  │ 1
                           ┌──────▼───────────┐
                           │ telegram_agents  │
                           └──────────────────┘
```

---

## Security Flow (RLS)

```
Client Request
     │
     ├─> HTTP Request with JWT
     │
     ▼
┌─────────────────────┐
│  Supabase Gateway   │
│  - Verify JWT       │
│  - Extract claims   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  PostgREST API      │
│  - Parse SQL query  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  RLS Policy Check   │
│  ┌───────────────┐  │
│  │ User context: │  │
│  │ - user_id     │  │
│  │ - role        │  │
│  │ - email       │  │
│  └───────────────┘  │
│                     │
│  Policy: "Users can │
│  only view their    │
│  own bookings"      │
│                     │
│  WHERE              │
│  patient_id =       │
│  auth.user_id()     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  PostgreSQL Query   │
│  - Add WHERE clause │
│  - Execute query    │
│  - Return results   │
└──────┬──────────────┘
       │
       ▼
   Client receives
   only authorized data
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Repository                  │
│  - Client code (React)                               │
│  - Configuration files                               │
└────────────────┬────────────────────────────────────┘
                 │
                 │ git push
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│                  Vercel (Automatic)                  │
│  ┌─────────────────────────────────────────────┐   │
│  │  Build Process:                              │   │
│  │  1. npm install                              │   │
│  │  2. npm run build                            │   │
│  │  3. Deploy to CDN                            │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  Result: https://your-app.vercel.app                │
└─────────────────────────────────────────────────────┘
                 │
                 │ API Calls
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│              Supabase (Always Running)               │
│  - PostgreSQL Database                               │
│  - Storage                                           │
│  - Auth                                              │
│  - Realtime                                          │
│  - Edge Functions                                    │
└─────────────────────────────────────────────────────┘
```

**Deployment Flow:**
1. Developer pushes code to GitHub
2. Vercel detects push
3. Vercel builds React app
4. Vercel deploys to global CDN
5. App communicates with Supabase
6. Zero downtime deployment ✅

---

This architecture provides:
✅ Better separation of concerns
✅ Automatic scaling
✅ Better security
✅ Real-time capabilities
✅ Simpler deployment
✅ Lower maintenance
