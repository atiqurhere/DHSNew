# DHS Admin Management System - Documentation

## Overview
Comprehensive admin management system with permission-based access control for the Dhaka Health Service platform.

## Features Implemented

### 1. Admin Management (`/admin/manage-admins`)
- **Create New Admins**: Add new admin users with custom permissions
- **Edit Admins**: Update admin details and permissions
- **Delete Admins**: Remove admin accounts (cannot delete last admin)
- **Permission System**:
  - `manageServices`: Can add/edit/delete services
  - `manageStaff`: Can verify/reject/manage staff
  - `manageBookings`: Can view/assign/update bookings
  - `managePayments`: Can manage payment transactions
  - `manageAdmins`: Can add/edit/delete other admins
  - `viewReports`: Can access analytics and reports

### 2. Services Management (`/admin/manage-services`)
- **CRUD Operations**: Create, Read, Update, Delete services
- **Service Fields**:
  - Name, Description, Category
  - Price, Duration
  - Image URL
  - Requirements (comma-separated)
  - Features (comma-separated)
  - Availability toggle
- **Features**:
  - Grid card view
  - Toggle service availability on/off
  - Real-time updates
  - Form validation

### 3. Staff Management (`/admin/manage-staff`)
- **Tabs**: Pending, Verified, All
- **Verify Staff**: Approve staff applications
- **Reject Staff**: Reject with reason
- **Staff Details Modal**:
  - Full name, email, phone
  - Specialization, experience, qualifications
  - Documents attached
  - Rating information
  - Verification status
- **Delete Staff**: Remove staff members

### 4. Bookings Management (`/admin/manage-bookings`)
- **Filter by Status**: All, Pending, Confirmed, In-Progress, Completed, Cancelled
- **View Details**: Full booking information modal
- **Assign Staff**: Select verified staff for booking
- **Update Status**: Change booking status
- **Table View** with:
  - Booking ID
  - Patient info
  - Service name
  - Date and time
  - Assigned staff
  - Current status

### 5. Notifications System

#### Patient Notifications (`/patient/notifications`)
- Filter: All, Unread, Read
- Mark as read (individual or all)
- Delete notifications (individual or read ones)
- Notification types: booking, payment, reminder, alert
- Icons based on type
- Link to related pages

#### Staff Notifications (`/staff/notifications`)
- Same features as patient notifications
- Additional notification types: assignment, verification
- Priority badges: High, Medium, Low
- Timestamp with date and time

## Backend API Endpoints

### Admin Management
```
GET    /api/admin/admins           - Get all admins
POST   /api/admin/admins           - Create new admin
PUT    /api/admin/admins/:id       - Update admin
DELETE /api/admin/admins/:id       - Delete admin
```

### Staff Management
```
GET    /api/admin/staff            - Get all staff
PUT    /api/admin/staff/:id/verify - Verify staff
PUT    /api/admin/staff/:id/reject - Reject staff with reason
PUT    /api/admin/staff/:id        - Update staff details
DELETE /api/admin/staff/:id        - Delete staff
```

### Bookings Management
```
GET    /api/admin/bookings                 - Get all bookings
PUT    /api/admin/bookings/:id/assign-staff - Assign staff to booking
PUT    /api/admin/bookings/:id/status       - Update booking status
```

### Services (existing)
```
GET    /api/services               - Get all services
POST   /api/services               - Create service
PUT    /api/services/:id           - Update service
DELETE /api/services/:id           - Delete service
```

### Notifications
```
GET    /api/notifications          - Get user's notifications
PUT    /api/notifications/:id/read - Mark notification as read
PUT    /api/notifications/mark-all-read - Mark all as read
DELETE /api/notifications/:id      - Delete notification
DELETE /api/notifications/delete-read - Delete all read notifications
```

## Database Schema Updates

### User Model
Added fields:
```javascript
permissions: {
  manageServices: Boolean,
  manageStaff: Boolean,
  manageBookings: Boolean,
  managePayments: Boolean,
  manageAdmins: Boolean,
  viewReports: Boolean
},
verificationStatus: String, // 'pending', 'verified', 'rejected'
rejectionReason: String,
specialization: String,
experience: String,
qualifications: String
```

## Frontend Routes

### Admin Routes
- `/admin/dashboard` - Admin dashboard with stats
- `/admin/manage-admins` - Admin management page
- `/admin/manage-services` - Services management page
- `/admin/manage-staff` - Staff management page
- `/admin/manage-bookings` - Bookings management page

### Patient Routes
- `/patient/notifications` - Patient notifications

### Staff Routes
- `/staff/notifications` - Staff notifications

## Component Files Created

### Admin Pages
1. `client/src/pages/admin/ManageAdmins.jsx` (250 lines)
   - Admin CRUD with permissions
   
2. `client/src/pages/admin/ManageServices.jsx` (350 lines)
   - Service management with image support
   
3. `client/src/pages/admin/ManageStaff.jsx` (380 lines)
   - Staff verification system
   
4. `client/src/pages/admin/ManageBookings.jsx` (450 lines)
   - Booking management with staff assignment

### Notification Pages
5. `client/src/pages/patient/Notifications.jsx` (250 lines)
   - Patient notification center
   
6. `client/src/pages/staff/StaffNotifications.jsx` (280 lines)
   - Staff notification center with priority

### Updated Files
7. `client/src/pages/admin/AdminDashboard.jsx`
   - Added management links with icons
   
8. `client/src/App.jsx`
   - Added routes for all new pages
   
9. `server/models/User.js`
   - Added permissions and verification fields
   
10. `server/controllers/adminController.js`
    - Added 10 new controller functions
    
11. `server/routes/adminRoutes.js`
    - Added 13 new endpoints

## Security Features

1. **Role-Based Access Control**: All admin routes protected with `PrivateRoute`
2. **Permission Checking**: Frontend checks for specific permissions
3. **Backend Authorization**: `protect` and `authorize` middleware on all routes
4. **Password Hashing**: Bcrypt for admin passwords
5. **JWT Authentication**: Token-based auth system
6. **Last Admin Protection**: Cannot delete the last admin

## UI Features

### Design Elements
- **Responsive Design**: Mobile, tablet, and desktop layouts
- **Card-Based Layout**: Clean card design for all items
- **Modal Dialogs**: For create/edit/view operations
- **Tab Navigation**: For filtering data
- **Status Badges**: Color-coded status indicators
- **Icons**: React Icons for visual clarity
- **Hover Effects**: Interactive UI elements
- **Animations**: Fade-in and slide animations
- **Toast Notifications**: React Toastify for feedback

### User Experience
- **Loading States**: Spinner while fetching data
- **Empty States**: Helpful messages when no data
- **Confirmation Dialogs**: For destructive actions
- **Form Validation**: Required fields and validation
- **Real-time Updates**: Immediate UI updates after actions
- **Search and Filter**: Easy data navigation

## Testing Checklist

### Admin Management
- [ ] Create admin with all permissions
- [ ] Create admin with limited permissions
- [ ] Edit admin details
- [ ] Edit admin permissions
- [ ] Delete admin
- [ ] Try to delete last admin (should fail)

### Services Management
- [ ] Create service with all fields
- [ ] Edit service
- [ ] Toggle service availability
- [ ] Delete service
- [ ] Upload service image

### Staff Management
- [ ] View pending staff
- [ ] Verify staff
- [ ] Reject staff with reason
- [ ] View staff details
- [ ] Delete staff

### Bookings Management
- [ ] View all bookings
- [ ] Filter by status
- [ ] Assign staff to booking
- [ ] Update booking status
- [ ] View booking details

### Notifications
- [ ] View all notifications
- [ ] Filter unread/read
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Delete notification
- [ ] Delete all read

## Next Steps (Optional Enhancements)

1. **Search Functionality**: Add search bars for admins, staff, bookings
2. **Pagination**: For large data sets
3. **Bulk Operations**: Select multiple items for bulk actions
4. **Export Data**: CSV/PDF export for reports
5. **Real-time Notifications**: WebSocket for live updates
6. **Advanced Filters**: Date range, multiple status selection
7. **Analytics Dashboard**: Charts and graphs for insights
8. **Audit Logs**: Track all admin actions
9. **Email Notifications**: Send emails on important events
10. **File Upload**: Direct image upload for services

## Technology Stack

**Frontend:**
- React 18.2.0
- React Router v6.20.0
- Tailwind CSS 3.3.6
- Axios 1.6.2
- React Icons 4.12.0
- React Toastify 9.1.3

**Backend:**
- Node.js 22.18.0
- Express.js 4.18.2
- MongoDB with Mongoose 8.0.0
- JWT for authentication
- Bcrypt.js for password hashing

## Notes

- All pages are fully responsive (mobile, tablet, desktop)
- Permission system is in place but middleware checking not yet implemented
- Backend routes are ready and can be tested with tools like Postman
- Notification backend routes need to be created in notificationController
- Consider adding real-time updates with Socket.io for notifications
- Default admin credentials: admin@dhs.com / admin123456 (from seed script)

## File Structure
```
client/src/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.jsx (updated)
│   │   ├── ManageAdmins.jsx (new)
│   │   ├── ManageServices.jsx (new)
│   │   ├── ManageStaff.jsx (new)
│   │   └── ManageBookings.jsx (new)
│   ├── patient/
│   │   └── Notifications.jsx (new)
│   └── staff/
│       └── StaffNotifications.jsx (new)
├── App.jsx (updated with new routes)

server/
├── models/
│   └── User.js (updated with permissions)
├── controllers/
│   └── adminController.js (updated with 10 new functions)
└── routes/
    └── adminRoutes.js (updated with new endpoints)
```
