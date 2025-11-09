# Supabase Migration - Complete Package

## 🎯 Overview

Complete migration guide for DHS Healthcare application from MongoDB/Express (MERN) to Supabase/PostgreSQL.

**Current Stack**: MongoDB + Express + React + Node.js  
**Target Stack**: PostgreSQL (Supabase) + React + Edge Functions

---

## 📁 Files Included

### 1. **01_DATABASE_SCHEMA.sql**
Complete PostgreSQL schema with:
- All 12 tables converted from Mongoose schemas
- Proper relationships and foreign keys
- JSONB fields for flexible data
- Indexes for performance
- Triggers and functions
- Views for complex queries

### 2. **02_ROW_LEVEL_SECURITY.sql**
Comprehensive security policies:
- RLS enabled on all tables
- Role-based access control
- User-specific data isolation
- Admin/Staff/Patient permissions
- Service role bypass for Edge Functions

### 3. **03_MIGRATION_GUIDE.md**
Step-by-step migration process:
- Supabase project setup
- Client library installation
- Authentication migration strategies
- Query pattern conversions
- Real-time implementation
- File storage migration

### 4. **04_EDGE_FUNCTIONS.md**
Replace Express backend logic:
- Email notification function
- Telegram bot webhook handler
- Scheduled cleanup jobs
- Custom JWT auth (optional)
- Deployment instructions

### 5. **05_FRONTEND_EXAMPLES.md**
Complete React code examples:
- Authentication pages
- Booking system
- Services management
- Real-time notifications
- File uploads
- Support tickets
- Admin dashboard

### 6. **06_DEPLOYMENT_GUIDE.md**
Single Vercel deployment:
- Project configuration
- Environment variables
- Custom domain setup
- Performance optimization
- Security headers
- Monitoring setup

### 7. **07_DATA_MIGRATION.md**
MongoDB to PostgreSQL data transfer:
- Complete migration script
- ID mapping (ObjectID → UUID)
- Relationship preservation
- Verification queries
- Rollback procedures

---

## 🚀 Quick Start (15 minutes)

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Install dependencies
cd client
npm install @supabase/supabase-js
```

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for database setup (~2 minutes)

### Step 2: Apply Database Schema
```bash
# In Supabase Dashboard > SQL Editor
# Copy and run: 01_DATABASE_SCHEMA.sql
# Then run: 02_ROW_LEVEL_SECURITY.sql
```

### Step 3: Setup Client
```bash
# Create client/.env
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > client/.env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> client/.env
```

### Step 4: Update Code
```javascript
// client/src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Step 5: Test Locally
```bash
cd client
npm run dev
```

---

## 📊 Migration Comparison

| Feature | Before (MERN) | After (Supabase) |
|---------|---------------|------------------|
| **Database** | MongoDB | PostgreSQL |
| **Backend** | Express.js | Edge Functions |
| **Auth** | Custom JWT | Supabase Auth / Custom JWT |
| **File Storage** | Local filesystem | Supabase Storage |
| **Real-time** | Socket.io (if used) | Built-in Realtime |
| **Deployment** | 2 servers (frontend + backend) | 1 frontend only |
| **Scaling** | Manual | Automatic |
| **Cost** | $10-50/month | $0-10/month |

---

## 📖 Database Schema Overview

### Core Tables

1. **users** - User accounts (patient, staff, admin)
2. **services** - Healthcare services offered
3. **bookings** - Service appointments
4. **payments** - Payment transactions
5. **notifications** - User notifications
6. **support_tickets** - Customer support with messages
7. **feedback** - Service ratings and reviews

### Supporting Tables

8. **live_chat_sessions** - Real-time chat sessions
9. **chatbot_responses** - Automated responses
10. **telegram_agents** - Live support agents
11. **telegram_bot_config** - Bot configuration
12. **page_content** - CMS for About/Contact pages

### Key Relationships

```
users (patient) ──┐
                  ├──> bookings ──> payments
users (staff) ────┘         │
                            └──> feedback
services ──────────────────>┘

users ──> support_tickets
users ──> notifications
users ──> live_chat_sessions <── telegram_agents
```

---

## 🔒 Security Features

### Row Level Security (RLS)
- ✅ Patients can only view their own bookings
- ✅ Staff can only view assigned bookings
- ✅ Admins can view all data
- ✅ Users can only modify their own data
- ✅ Public data is viewable by everyone

### Authentication
- ✅ Secure password hashing
- ✅ JWT tokens with expiration
- ✅ Role-based access control
- ✅ Session management

### API Security
- ✅ HTTPS only
- ✅ CORS configured
- ✅ Rate limiting (Supabase built-in)
- ✅ SQL injection prevention

---

## 💡 Key Features Preserved

### ✅ All Current Features Work
- User registration & login
- Service browsing and booking
- Payment processing
- Admin dashboard
- Staff management
- Email notifications
- Support tickets
- Live chat with Telegram
- Chatbot responses
- File uploads (prescriptions, documents)
- Real-time notifications
- CMS for pages

### ✨ New Features Enabled
- Real-time updates without polling
- Better performance (PostgreSQL)
- Automatic scaling
- Better developer experience
- Built-in database backups
- Better monitoring and logs

---

## 🔄 Query Migration Examples

### Find All
```javascript
// Before (MongoDB)
const bookings = await Booking.find({ patient: userId })

// After (Supabase)
const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('patient_id', userId)
```

### Create
```javascript
// Before
const booking = await Booking.create({ ...data })

// After
const { data } = await supabase
  .from('bookings')
  .insert({ ...data })
  .select()
  .single()
```

### Update
```javascript
// Before
await Booking.findByIdAndUpdate(id, { status: 'completed' })

// After
await supabase
  .from('bookings')
  .update({ status: 'completed' })
  .eq('id', id)
```

### Populate (Join)
```javascript
// Before
const booking = await Booking.findById(id)
  .populate('service')
  .populate('patient')

// After
const { data } = await supabase
  .from('bookings')
  .select(`
    *,
    service:services(*),
    patient:users!bookings_patient_id_fkey(*)
  `)
  .eq('id', id)
  .single()
```

---

## 📦 Dependencies

### Remove (No longer needed)
```json
{
  "mongoose": "^8.0.0",
  "express": "^4.18.2",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "multer": "^1.4.5",
  "nodemailer": "^7.0.10"
}
```

### Add
```json
{
  "@supabase/supabase-js": "^2.38.4"
}
```

---

## 🎓 Learning Resources

### Supabase
- **Docs**: https://supabase.com/docs
- **Examples**: https://github.com/supabase/supabase/tree/master/examples
- **Discord**: https://discord.supabase.com

### PostgreSQL
- **Tutorial**: https://www.postgresqltutorial.com/
- **JSON in PostgreSQL**: https://www.postgresql.org/docs/current/datatype-json.html

### Edge Functions (Deno)
- **Deno Docs**: https://deno.land/manual
- **Supabase Functions**: https://supabase.com/docs/guides/functions

---

## ⚡ Performance Tips

### 1. Use Indexes
Already added in schema for common queries

### 2. Limit Data
```javascript
// Good: Only fetch what you need
.select('id, name, email')

// Bad: Fetch everything
.select('*')
```

### 3. Use Views
Pre-defined joins in database for complex queries

### 4. Batch Operations
```javascript
// Insert multiple rows at once
await supabase.from('notifications').insert([...notifications])
```

### 5. Cache Static Data
```javascript
// Cache services list in React state
const [services, setServices] = useState([])
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. CORS Error
**Solution**: Add your domain to Supabase CORS settings

#### 2. RLS Blocking Queries
**Solution**: Check your JWT claims match RLS policies

#### 3. Foreign Key Violations
**Solution**: Ensure related records exist before inserting

#### 4. JSONB Query Issues
**Solution**: Use PostgreSQL JSONB operators:
```javascript
.contains('tags', ['urgent'])
.jsonContains('address', { city: 'Dhaka' })
```

#### 5. Real-time Not Working
**Solution**: Enable realtime in Supabase Dashboard for table

---

## 📞 Support

### Getting Help
1. Check documentation files first
2. Search Supabase Discord
3. Check PostgreSQL documentation
4. Review example code in `05_FRONTEND_EXAMPLES.md`

### File Issues
- Database schema issues → `01_DATABASE_SCHEMA.sql`
- Security issues → `02_ROW_LEVEL_SECURITY.sql`
- Migration steps → `03_MIGRATION_GUIDE.md`
- Backend logic → `04_EDGE_FUNCTIONS.md`
- Frontend code → `05_FRONTEND_EXAMPLES.md`
- Deployment → `06_DEPLOYMENT_GUIDE.md`
- Data transfer → `07_DATA_MIGRATION.md`

---

## ✅ Migration Checklist

### Planning Phase
- [ ] Review all migration documents
- [ ] Create Supabase project
- [ ] Backup MongoDB database
- [ ] Test schema in staging environment

### Database Phase
- [ ] Apply database schema (`01_DATABASE_SCHEMA.sql`)
- [ ] Apply RLS policies (`02_ROW_LEVEL_SECURITY.sql`)
- [ ] Create storage buckets
- [ ] Test sample queries

### Development Phase
- [ ] Install Supabase client
- [ ] Update environment variables
- [ ] Migrate authentication
- [ ] Replace all API calls
- [ ] Implement real-time features
- [ ] Migrate file uploads
- [ ] Test all features locally

### Backend Phase
- [ ] Deploy Edge Functions
- [ ] Setup email service (Resend)
- [ ] Configure Telegram webhook
- [ ] Setup cron jobs (GitHub Actions)

### Data Migration Phase
- [ ] Run data migration script
- [ ] Verify data integrity
- [ ] Test with migrated data

### Deployment Phase
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Setup custom domain (optional)
- [ ] Test production deployment

### Post-Deployment
- [ ] Monitor logs
- [ ] Check performance
- [ ] Verify all features work
- [ ] Update documentation
- [ ] Train team on new system

---

## 🎉 Success Metrics

After migration, you should have:
- ✅ **Zero** backend servers to maintain
- ✅ **Automatic** scaling
- ✅ **Built-in** real-time capabilities
- ✅ **Better** performance (PostgreSQL)
- ✅ **Lower** costs
- ✅ **Easier** development
- ✅ **Better** monitoring
- ✅ **Automatic** backups

---

## 📅 Estimated Timeline

- **Planning & Setup**: 1-2 days
- **Database Migration**: 2-3 days
- **Frontend Migration**: 5-7 days
- **Edge Functions**: 2-3 days
- **Testing**: 3-4 days
- **Data Migration**: 1 day
- **Deployment**: 1 day

**Total**: 2-3 weeks for complete migration

---

## 🚀 Next Steps

1. **Read** `03_MIGRATION_GUIDE.md` for detailed steps
2. **Apply** database schema from `01_DATABASE_SCHEMA.sql`
3. **Study** example code in `05_FRONTEND_EXAMPLES.md`
4. **Start** migrating one feature at a time
5. **Test** thoroughly before deploying
6. **Deploy** using `06_DEPLOYMENT_GUIDE.md`

---

## 📄 License

This migration guide is part of the DHS Healthcare project.

---

**Good luck with your migration! 🚀**
