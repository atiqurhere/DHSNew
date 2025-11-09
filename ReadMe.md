# DHS - Dhaka Health Service# DHS - Dhaka Health Service

**"Modern healthcare, delivered to your doorstep."****"Modern healthcare, delivered to your doorstep."**



A comprehensive full-stack healthcare service platform built with MERN stack for Dhaka, Bangladesh.A comprehensive full-stack healthcare service platform built with MERN stack (MongoDB, Express, React, Node.js) for Dhaka, Bangladesh. Inspired by UK's NHS and Cera Care, providing modern healthcare solutions with three main portals: **Patient**, **Staff**, and **Admin**.



## 🌟 Features## 🌟 Features



- 🏥 Healthcare Service Booking System- 🏥 **Healthcare Service Booking System** - Book nurses, caregivers, doctors, and home services

- 👤 User Authentication & Profile Management  - 👤 **User Authentication & Profile Management** - Secure JWT-based authentication

- 💬 AI-Powered Chatbot with Live Telegram Agent Support- 💬 **AI-Powered Chatbot** - Intelligent chatbot with live agent support via Telegram

- 🎫 Support Ticket System- 🎫 **Support Ticket System** - Comprehensive ticket management with real-time messaging

- 📧 Email Notifications- 📧 **Email Notifications** - Automated notifications for bookings, tickets, and updates

- 👨‍⚕️ Staff Management & Verification- 👨‍⚕️ **Staff Management** - Staff registration, verification, and assignment system

- 📊 Admin Dashboard with Analytics- 📊 **Admin Dashboard** - Complete analytics and management tools

- 💳 Payment Integration- 💳 **Payment Integration** - Secure payment processing

- 📱 Fully Responsive Design- 📱 **Responsive Design** - Mobile-ready interface with Tailwind CSS

- 🔒 **Role-Based Access Control** - Separate portals for patients, staff, and admins

## 🛠 Tech Stack

## 🛠 Tech Stack

### Frontend

- React 18.2.0 + Vite 5.4.21### Frontend

- React Router v6- **React 18.2.0** - Modern UI library

- Tailwind CSS- **Vite 5.4.21** - Lightning-fast build tool

- Axios + React Toastify- **React Router v6** - Client-side routing

- **Tailwind CSS** - Utility-first CSS framework

### Backend- **Axios** - HTTP client

- Node.js 22.18.0 + Express 4.18.2- **React Toastify** - Toast notifications

- MongoDB with Mongoose 8.0.0

- JWT Authentication### Backend

- Multer (File Uploads)- **Node.js 22.18.0** - JavaScript runtime

- Node Telegram Bot API- **Express 4.18.2** - Web framework

- Nodemailer- **MongoDB with Mongoose 8.0.0** - Database

- **JWT** - Authentication tokens

## 📦 Installation- **Multer** - File upload handling

- **Node Telegram Bot API** - Telegram integration

### Prerequisites- **Nodemailer** - Email service

- Node.js (v18+)- Payment Gateway: Mock integration for bKash/Nagad

- MongoDB- Hosting ready for AWS or DigitalOcean

- npm/yarn## ■ Website Functionalities

### 1. Landing Page (Public)

### Setup- Hero banner with tagline

- Service categories grid (Home Care, Nurse Care, Medicine Delivery, Doctor on Call,

1. Clone repository:Equipment Rental)

```bash- “Book Now” and “Apply as Staff” buttons

git clone https://github.com/atiqurhere/DHS.git- Testimonials, About Us, Contact section

cd DHS### 2. Patient Portal

```- Register/Login (JWT)

- Dashboard: Upcoming bookings, order status, medical history

2. Install dependencies:- Book Service page (select service, upload prescription, payment)

```bash- View Order Status (Pending → Accepted → Completed)

npm run install-all- Rate Service and feedback

```- Notifications via email

### 3. Staff Portal

3. Configure environment variables:- Login/Registration (verified by Admin)

- Dashboard: Assigned tasks, availability

**server/.env:**- Update task status

```env- Access training documents

PORT=5000### 4. Admin Dashboard

MONGODB_URI=your_mongodb_uri- Secure login

JWT_SECRET=your_secret- KPI overview (bookings, revenue, staff, feedback)

JWT_EXPIRE=30d- Service Management: Add/Edit/Delete services, set price, availability

EMAIL_USER=your_email- Staff Management: Verify staff, assign tasks

EMAIL_PASS=your_password- Booking Management: Approve/Reject, assign staff

CLIENT_URL=http://localhost:3000- Payment Tracking & Reports

TELEGRAM_BOT_TOKEN=your_token- Feedback Monitoring

```- Audit logs

## ■■ Database Models

**client/.env:**- User (role, name, contact, password, documents)

```env- Service (name, description, price, availability, image)

VITE_API_URL=http://localhost:5000- Booking (userId, serviceId, staffId, date, time, status, payment, feedback)

```- Payment (bookingId, amount, method, status)

- Notification (userId, message, read/unread)

4. Seed admin (optional):- Feedback (bookingId, rating, comment)

```bash## ■ Authentication Flow

cd server && npm run seed- JWT-based authentication

```- Middleware for role protection

- bcrypt for password hashing

## 🚀 Running## ■ Folder Structure

/client (React frontend)

```bash/server (Node backend)

npm run dev  # Both client & server/models

npm run client  # Frontend only/routes

npm run server  # Backend only/controllers

```/middleware

/config

## 🌐 Vercel Deployment## ■ UI / UX Notes

- NHS-style blue & white theme

1. Push to GitHub:- Icons for each service

```bash- Responsive layout

git add .- Sidebar for dashboards

git commit -m "Initial commit"- Toast notifications, modals

git remote add origin https://github.com/atiqurhere/DHS.git- Accessibility friendly

git push -u origin main## ■ Run Commands

```Frontend:

cd client

2. Import to Vercel and configure environment variablesnpm install

npm run dev

## 📁 Project StructureBackend:

cd server

```npm install

DHS/npm run dev

├── client/           # React frontend## ■ Future Expansion

│   ├── src/- Mobile app (React Native)

│   │   ├── components/- GPS tracking for delivery

│   │   ├── pages/- Partner integrations (pharmacies, hospitals)

│   │   ├── context/- AI chatbot for patient queries
│   │   └── utils/
│   └── package.json
├── server/          # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── vercel.json
└── package.json
```

## 🔑 Key Features

- **Patient Portal:** Service booking, profile management, notifications
- **Staff Portal:** Task management, availability tracking
- **Admin Dashboard:** Complete system management
- **Live Chat:** AI chatbot with Telegram agent handoff
- **Support Tickets:** Full ticket management system

## 📡 Main API Endpoints

- `/api/auth/*` - Authentication
- `/api/services/*` - Service management
- `/api/bookings/*` - Booking operations
- `/api/support/*` - Support tickets
- `/api/telegram/*` - Live chat
- `/api/notifications/*` - Notifications

## 👨‍💻 Author

**Atiqur Rahman**
- GitHub: [@atiqurhere](https://github.com/atiqurhere)

## 📄 License

ISC

---

Made with ❤️ for healthcare in Dhaka
