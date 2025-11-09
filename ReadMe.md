# 🏥 DHS Healthcare - Modern Healthcare Management System

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Supabase-blue)]()
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black)]()

> A complete healthcare management system with patient booking, staff management, admin dashboard, and real-time notifications. Fully migrated to Supabase for serverless architecture.

---

## ✨ Features

### 👤 For Patients
- **Service Booking**: Browse and book healthcare services
- **Payment Processing**: Secure online payment system  
- **Booking History**: Track all appointments and services
- **Real-time Notifications**: Instant updates on booking status
- **Support Tickets**: Get help from support team
- **Profile Management**: Update personal information

### 👨‍⚕️ For Healthcare Staff
- **Booking Management**: View and manage assigned bookings
- **Schedule Overview**: See daily/weekly schedule
- **Status Updates**: Update booking and service status
- **Notifications**: Receive alerts for new assignments

### 👨‍💼 For Administrators
- **Dashboard**: Overview of all system metrics
- **Service Management**: Create, update, delete services
- **Staff Verification**: Approve/reject staff applications
- **Booking Oversight**: Manage all bookings system-wide
- **User Management**: Manage patients, staff, admins
- **Support System**: Handle support tickets
- **System Analytics**: View statistics and reports

### 🔥 Additional Features
- **Real-time Updates**: Live notifications without refresh
- **AI Chatbot**: Automated customer support
- **File Uploads**: Profile pictures, documents via Supabase Storage
- **Role-based Access**: Secure permissions system
- **Responsive Design**: Works on all devices
- **Dark Mode Ready**: Modern UI/UX

---

## 🚀 Quick Start (30 Minutes)

### Prerequisites
- Node.js 18+ installed
- Git installed
- Supabase account (free)
- Vercel account (free) - for deployment

### 1. Clone & Install (5 min)

```bash
# Clone repository
git clone <your-repo-url>
cd DHS-2

# Install dependencies
cd client
npm install
```

### 2. Supabase Setup (15 min)

1. **Create Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project: "dhs-healthcare"
   - Save project URL and anon key

2. **Run Database Schema**
   - Open Supabase SQL Editor
   - Run `SUPABASE_MIGRATION/01_DATABASE_SCHEMA.sql`
   - Run `SUPABASE_MIGRATION/02_ROW_LEVEL_SECURITY.sql`

3. **Configure Storage**
   - Create bucket: `uploads` (set to public)
   - Add upload policies for authenticated users

4. **Create Admin User**
   - Create user in Supabase Auth dashboard
   - Run SQL:
     ```sql
     UPDATE public.users 
     SET role = 'admin' 
     WHERE email = 'your-admin@example.com';
     ```

### 3. Configure Environment (2 min)

```bash
# In client folder
cp .env.template .env

# Edit .env and add your Supabase credentials:
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxx
```

### 4. Run Development Server (1 min)

```bash
npm run dev
# Open http://localhost:5173
```

### 5. Test & Deploy (7 min)

1. **Test locally**
   - Register new user
   - Login
   - Book a service
   - Check notifications

2. **Deploy to Vercel**
   - See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
   - Takes ~10 minutes
   - Your app is live! 🎉

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md)** | ✅ Complete migration overview |
| **[QUICK_SETUP.md](./QUICK_SETUP.md)** | 🚀 Step-by-step setup guide |
| **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** | 📦 Deployment instructions |
| **[API_MIGRATION_REFERENCE.js](./API_MIGRATION_REFERENCE.js)** | 📖 API patterns reference |
| **SUPABASE_MIGRATION/** | 📁 Complete migration docs (13 files) |

---

## 🏗️ Technology Stack

### Frontend
- **React 18** - UI library
- **Vite 5** - Build tool & dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Icons** - Icon library
- **React Toastify** - Notifications

### Backend (Serverless)
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - File storage
  - Row Level Security (RLS)

### Deployment
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend infrastructure

---

## 📁 Project Structure

```
DHS 2/
├── client/                          # Frontend React app
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   └── ...
│   │   ├── context/
│   │   │   └── SupabaseAuthContext.jsx  # Auth provider
│   │   ├── lib/
│   │   │   └── supabase.js          # Supabase client
│   │   ├── pages/
│   │   │   ├── admin/               # Admin pages
│   │   │   ├── patient/             # Patient pages
│   │   │   ├── staff/               # Staff pages
│   │   │   └── support/             # Support pages
│   │   ├── utils/
│   │   │   └── supabaseAPI.js       # API layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json                  # Vercel config
│
├── server/                          # [DEPRECATED] Old backend
│   └── ... (For reference only)
│
├── SUPABASE_MIGRATION/              # Migration documentation
│   ├── 01_DATABASE_SCHEMA.sql
│   ├── 02_ROW_LEVEL_SECURITY.sql
│   ├── 03_MIGRATION_GUIDE.md
│   └── ... (10 more files)
│
├── MIGRATION_COMPLETE.md            # Migration summary
├── QUICK_SETUP.md                   # Setup guide
├── VERCEL_DEPLOYMENT.md             # Deployment guide
└── README.md                        # This file
```

---

## 🔐 Security Features

- ✅ **Supabase Auth**: Industry-standard JWT authentication
- ✅ **Row Level Security**: Database-level access control
- ✅ **Role-based Access**: Patient, Staff, Admin roles
- ✅ **HTTPS Only**: Encrypted connections
- ✅ **Environment Variables**: Secure credential storage
- ✅ **SQL Injection Protection**: Parameterized queries
- ✅ **CORS Configured**: Proper cross-origin policies

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Register new patient
- [ ] Register new staff (pending approval)
- [ ] Login as patient
- [ ] Login as staff (verified)
- [ ] Login as admin
- [ ] Logout

**Patient Features:**
- [ ] View services
- [ ] Book service
- [ ] Make payment
- [ ] View bookings
- [ ] Receive notifications
- [ ] Create support ticket

**Staff Features:**
- [ ] View assigned bookings
- [ ] Update booking status
- [ ] View notifications

**Admin Features:**
- [ ] View dashboard
- [ ] Create service
- [ ] Verify staff
- [ ] Manage bookings
- [ ] Respond to tickets

---

## 🚢 Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set in Vercel dashboard
   VITE_SUPABASE_URL=your_production_url
   VITE_SUPABASE_ANON_KEY=your_production_key
   ```

2. **Deploy**
   ```bash
   # Automatic via Git push
   git push origin main
   
   # Or manual via Vercel CLI
   vercel --prod
   ```

3. **Verify**
   - Check deployment logs
   - Test all features
   - Monitor Supabase dashboard

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

---

## 📊 Database Schema

### Core Tables
- **users** - All system users (patients, staff, admins)
- **services** - Healthcare services offered
- **bookings** - Service appointments
- **payments** - Payment records
- **notifications** - User notifications
- **support_tickets** - Customer support
- **chatbot_responses** - AI chatbot data
- **page_content** - Dynamic CMS content

See `SUPABASE_MIGRATION/01_DATABASE_SCHEMA.sql` for complete schema.

---

## 🔄 Migration from MERN

This project was successfully migrated from:
- **MongoDB → PostgreSQL (Supabase)**
- **Express.js → Supabase Edge Functions**
- **Custom JWT → Supabase Auth**
- **Local uploads → Supabase Storage**

### Migration Benefits
- ✅ No backend server to maintain
- ✅ Built-in authentication
- ✅ Real-time subscriptions
- ✅ Better performance
- ✅ Lower costs
- ✅ Easier scaling

See [MIGRATION_COMPLETE.md](./MIGRATION_COMPLETE.md) for full details.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👨‍💻 Developer

**Project**: DHS Healthcare Management System
**Stack**: React + Supabase + Vercel
**Status**: Production Ready ✅

---

## 📞 Support

- **Documentation**: See docs in project root
- **Issues**: Open GitHub issue
- **Email**: support@dhs-healthcare.com (if configured)

---

## 🎉 Acknowledgments

- **Supabase** - For amazing BaaS platform
- **Vercel** - For seamless deployment
- **React** - For powerful UI library
- **Tailwind CSS** - For beautiful styling

---

## 📈 Roadmap

- [ ] Mobile app (React Native)
- [ ] Email notifications (Edge Functions)
- [ ] SMS notifications (Twilio integration)
- [ ] Video consultations (WebRTC)
- [ ] Payment gateway integration (Stripe)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] PWA features

---

**Built with ❤️ for better healthcare management**

*Last Updated: Migration Complete - Production Ready*
*Version: 2.0.0 (Supabase)*
