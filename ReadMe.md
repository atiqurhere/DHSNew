# 🏥 DHS Healthcare - Production Ready

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Supabase-blue)]()
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black)]()

> Modern healthcare management system with patient booking, staff management, admin dashboard, and real-time notifications. Built with React and Supabase for serverless architecture.

---

## ✨ Features

### 👤 For Patients
- **Service Booking** - Browse and book healthcare services
- **Payment Processing** - Secure online payment system  
- **Booking History** - Track all appointments
- **Real-time Notifications** - Instant updates on booking status
- **Support Tickets** - Get help from support team
- **Profile Management** - Update personal information

### 👨‍⚕️ For Healthcare Staff
- **Booking Management** - View and manage assigned bookings
- **Schedule Overview** - See daily/weekly schedule
- **Status Updates** - Update booking and service status
- **Notifications** - Receive alerts for new assignments

### 👨‍💼 For Administrators
- **Dashboard** - Overview of all system metrics
- **Service Management** - Create, update, delete services
- **Staff Verification** - Approve/reject staff applications
- **Booking Oversight** - Manage all bookings system-wide
- **User Management** - Manage patients, staff, admins
- **Support System** - Handle support tickets
- **System Analytics** - View statistics and reports

### 🔥 Additional Features
- **Real-time Updates** - Live notifications without refresh
- **AI Chatbot** - Automated customer support
- **File Uploads** - Profile pictures, documents via Supabase Storage
- **Role-based Access** - Secure permissions system
- **Responsive Design** - Works on all devices

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free at [supabase.com](https://supabase.com))
- Vercel account for deployment (optional)

### 1. Clone & Install

\`\`\`bash
git clone <your-repo-url>
cd DHS-2/client
npm install
\`\`\`

### 2. Database Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Run the SQL files in the `database` folder in order:
   - `schema.sql` - Creates all tables and functions
   - `security.sql` - Applies Row Level Security policies
   - `seed.sql` - Adds sample services (optional)
   - `admin.sql` - Creates your first admin user

See [database/README.md](./database/README.md) for detailed instructions.

### 3. Configure Environment

\`\`\`bash
# Copy environment template
cp .env.template .env

# Edit .env and add your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
# Open http://localhost:3000
\`\`\`

### 5. Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

---

## 🏗️ Technology Stack

### Frontend
- **React 18** - UI library with hooks
- **Vite 5** - Fast build tool & dev server
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **React Icons** - Icon library
- **React Toastify** - Toast notifications

### Backend (Serverless)
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication & authorization
  - Real-time subscriptions
  - File storage
  - Row Level Security (RLS)

### Deployment
- **Vercel** - Frontend hosting (recommended)
- **Supabase Cloud** - Backend infrastructure

---

## 📁 Project Structure

\`\`\`
DHS 2/
├── client/                      # React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   │   ├── admin/           # Admin dashboard pages
│   │   │   ├── patient/         # Patient pages
│   │   │   ├── staff/           # Staff pages
│   │   │   └── support/         # Support pages
│   │   ├── context/             # React context (Auth)
│   │   ├── lib/                 # Supabase client config
│   │   ├── utils/               # Utility functions & API
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── public/                  # Static assets
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Vite configuration
│   └── vercel.json              # Vercel deployment config
│
├── database/                    # Database setup files
│   ├── schema.sql               # Database schema
│   ├── security.sql             # RLS policies
│   ├── seed.sql                 # Sample data
│   ├── admin.sql                # Create admin user
│   └── README.md                # Setup instructions
│
├── README.md                    # This file
├── START_HERE.md                # Getting started guide
└── DEPLOYMENT.md                # Deployment instructions
\`\`\`

---

## 🔐 Security Features

- ✅ **Supabase Auth** - Industry-standard JWT authentication
- ✅ **Row Level Security** - Database-level access control
- ✅ **Role-based Access** - Patient, Staff, Admin roles
- ✅ **HTTPS Only** - Encrypted connections
- ✅ **Environment Variables** - Secure credential storage
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **Security Headers** - XSS, clickjacking protection

---

## 🧪 Testing

### Build Production Bundle

\`\`\`bash
npm run build
# Check dist/ folder for output
\`\`\`

### Preview Production Build

\`\`\`bash
npm run preview
# Test at http://localhost:4173
\`\`\`

### Manual Testing Checklist

- [ ] Register new patient account
- [ ] Login and view dashboard
- [ ] Browse and book a service
- [ ] View notifications
- [ ] Create support ticket
- [ ] Test admin dashboard (if admin)
- [ ] Verify responsive design on mobile

---

## 📊 Database Schema

### Core Tables
- **users** - All system users (patients, staff, admins)
- **services** - Healthcare services offered
- **bookings** - Service appointments
- **payments** - Payment records
- **notifications** - User notifications
- **support_tickets** - Customer support
- **ticket_messages** - Support ticket conversations
- **chatbot_responses** - AI chatbot data
- **page_content** - Dynamic CMS content
- **telegram_sessions** - Telegram bot sessions

See `database/schema.sql` for complete schema.

---

## 🚢 Deployment

### Quick Deploy to Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `client`
4. Add environment variables
5. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open Pull Request

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 📞 Support

- **Documentation** - See README.md and DEPLOYMENT.md
- **Database Setup** - See database/README.md
- **Issues** - Open GitHub issue

---

## 🎉 Acknowledgments

- **Supabase** - Amazing BaaS platform
- **Vercel** - Seamless deployment
- **React** - Powerful UI library
- **Tailwind CSS** - Beautiful styling

---

**Built with ❤️ for better healthcare management**

*Version: 2.0.0 (Production Ready)*
