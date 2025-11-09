# DHS - Dhaka Health Service

Modern healthcare platform for Dhaka, Bangladesh. Full-stack application built with React.js, Node.js, Express, and MongoDB.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or connection URI)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
git clone <your-repo-url>
cd DHS
```

#### 2. Setup Backend
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dhs
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

#### 3. Setup Frontend
```bash
cd client
npm install
```

### Running the Application

#### Start MongoDB
Make sure MongoDB is running on your system.

#### Start Backend Server
```bash
cd server
npm run dev
```
Server will run on http://localhost:5000

#### Start Frontend
```bash
cd client
npm run dev
```
Frontend will run on http://localhost:3000

## 📱 Features

### Patient Portal
- Register and login
- Browse and book healthcare services
- Upload prescriptions
- Make payments (bKash, Nagad, Card, Cash)
- View booking history and status
- Rate and review services
- Receive notifications

### Staff Portal
- Apply as healthcare professional
- View assigned tasks
- Update task status (Assigned → In Progress → Completed)
- Manage availability
- View task history

### Admin Dashboard
- View analytics and KPIs
- Manage services (Add, Edit, Delete)
- Verify and manage staff
- Assign staff to bookings
- Monitor payments and revenue
- View feedback and ratings
- Manage all bookings

## 🛠️ Technology Stack

### Frontend
- React.js 18
- Vite
- Tailwind CSS
- React Router v6
- Axios
- React Icons
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Multer for file uploads

## 📂 Project Structure

```
DHS/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   ├── utils/         # Utilities (API config)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                # Backend Node.js application
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── uploads/         # Uploaded files
│   ├── server.js        # Entry point
│   └── package.json
│
└── ReadMe.md
```

## 🔐 Default Accounts

Create these accounts for testing:

**Admin:**
- Register with role: admin (need to manually set in database)
- Email: admin@dhs.com
- Password: admin123

**Patient:**
- Register normally through the UI
- Role: patient (default)

**Staff:**
- Register with "Apply as Staff" option
- Requires admin verification

## 🎨 UI/UX Design

- NHS-inspired blue and white color scheme
- Fully responsive design
- Accessible and user-friendly
- Toast notifications for user feedback
- Modal dialogs for important actions

## 📡 API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update profile

### Services
- GET `/api/services` - Get all services
- GET `/api/services/:id` - Get single service
- POST `/api/services` - Create service (Admin)
- PUT `/api/services/:id` - Update service (Admin)
- DELETE `/api/services/:id` - Delete service (Admin)

### Bookings
- POST `/api/bookings` - Create booking (Patient)
- GET `/api/bookings/my-bookings` - Get user bookings
- GET `/api/bookings` - Get all bookings (Admin/Staff)
- GET `/api/bookings/:id` - Get single booking
- PUT `/api/bookings/:id/status` - Update status
- PUT `/api/bookings/:id/assign` - Assign staff (Admin)
- POST `/api/bookings/:id/feedback` - Submit feedback

### Payments
- POST `/api/payments` - Create payment
- GET `/api/payments/my-payments` - Get user payments
- GET `/api/payments` - Get all payments (Admin)
- GET `/api/payments/stats` - Get payment statistics

### Admin
- GET `/api/admin/stats` - Dashboard statistics
- GET `/api/admin/staff` - Get all staff
- PUT `/api/admin/staff/:id/verify` - Verify staff
- PUT `/api/admin/staff/:id` - Update staff
- DELETE `/api/admin/staff/:id` - Delete staff
- GET `/api/admin/patients` - Get all patients
- GET `/api/admin/feedback` - Get all feedback

## 🔮 Future Enhancements

- Mobile app (React Native)
- Real-time notifications using Socket.io
- GPS tracking for service delivery
- Video consultation feature
- AI chatbot for patient queries
- Integration with pharmacies and hospitals
- Multi-language support
- Advanced analytics and reporting

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email info@dhs.com.bd or create an issue in the repository.
