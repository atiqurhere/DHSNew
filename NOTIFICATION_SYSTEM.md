# DHS Notification System

## Overview
The DHS notification system provides real-time updates to users about important events and actions.

## Notification Types

### For All Users
- **`welcome`** - Welcome notification sent when user registers

### For Patients
- **`booking`** - General booking updates
- **`booking_confirmed`** - Booking has been confirmed
- **`booking_cancelled`** - Booking has been cancelled
- **`booking_completed`** - Service has been completed
- **`payment`** - Payment related notifications
- **`payment_success`** - Payment processed successfully
- **`payment_failed`** - Payment failed
- **`staff_assigned`** - Staff member assigned to their booking

### For Staff
- **`welcome`** - Welcome notification
- **`staff_verified`** - Application approved by admin
- **`staff_rejected`** - Application rejected by admin
- **`staff_assigned`** - Assigned to a new booking
- **`booking`** - Booking status updates
- **`system`** - System notifications

### For Admins
- **`staff_application`** - New staff member registered
- **`booking`** - New booking received
- **`payment`** - Payment notifications
- **`new_service`** - Service added/updated
- **`system`** - System notifications

## Notification Helper Functions

### Location
`server/utils/notificationHelper.js`

### Available Functions

1. **`sendWelcomeNotification(userId, userName, role)`**
   - Sends welcome notification to new users
   - Called automatically during registration

2. **`sendBookingNotification(userId, bookingId, status, serviceName)`**
   - Sends booking status updates to patients
   - Statuses: pending, confirmed, assigned, in-progress, completed, cancelled, rejected

3. **`sendPaymentNotification(userId, paymentId, status, amount)`**
   - Sends payment status notifications
   - Statuses: success, pending, failed

4. **`sendStaffApplicationNotification(staffId, staffName, specialization)`**
   - Notifies all admins about new staff applications
   - Called automatically when staff registers

5. **`sendStaffVerificationNotification(staffId, isApproved, rejectionReason)`**
   - Notifies staff member about verification status
   - Call when admin approves/rejects staff

6. **`sendNewBookingNotificationToAdmins(bookingId, patientName, serviceName)`**
   - Notifies all admins about new bookings
   - Call when patient creates booking

7. **`sendStaffAssignmentNotification(staffId, bookingId, serviceName, patientName)`**
   - Notifies staff when assigned to booking
   - Call when admin assigns staff to booking

## Usage Examples

### In Controllers

```javascript
const { sendWelcomeNotification, sendBookingNotification } = require('../utils/notificationHelper');

// After user registration
await sendWelcomeNotification(user._id, user.name, user.role);

// After booking status change
await sendBookingNotification(
  booking.patient,
  booking._id,
  'confirmed',
  booking.service.name
);

// After staff verification
await sendStaffVerificationNotification(
  staff._id,
  true, // approved
  null  // no rejection reason
);
```

## Frontend Components

### Patient Notifications
**Path:** `client/src/pages/patient/Notifications.jsx`
- Shows bookings, payments, and general notifications
- Icon colors: green (success), red (error), blue (info)

### Staff Notifications
**Path:** `client/src/pages/staff/StaffNotifications.jsx`
- Shows assignments, verifications, and bookings
- Includes calendar icon for assignments

### Admin Notifications
**Path:** `client/src/pages/admin/AdminNotifications.jsx`
- Shows staff applications, new bookings, payments
- Special icons: user icon for staff apps, cart for bookings

## Notification Badge

The notification icon in the navbar shows the count of **unread notifications only**.

### Implementation
```javascript
// In Navbar.jsx
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (user) {
    fetchUnreadCount();
  }
}, [user]);

const fetchUnreadCount = async () => {
  const { data } = await api.get('/notifications');
  const unread = data.filter(n => !n.isRead).length;
  setUnreadCount(unread);
};
```

## API Endpoints

### Get Notifications
```
GET /api/notifications
```
Returns all notifications for the authenticated user, sorted by newest first.

### Mark as Read
```
PUT /api/notifications/:id/read
```
Marks a specific notification as read.

### Mark All as Read
```
PUT /api/notifications/read-all
```
Marks all user's notifications as read.

### Delete Notification
```
DELETE /api/notifications/:id
```
Deletes a specific notification.

## Scripts

### Reset Notifications
```bash
node server/resetNotifications.js
```
- Deletes ALL existing notifications
- Creates welcome notification for each existing user
- All notifications created as unread

### Seed Notifications (Old - Not Used)
```bash
node server/seedNotifications.js
```
- Creates random test notifications
- **Not recommended** - use resetNotifications instead

## Integration Checklist

When adding new features, remember to add notifications:

- [ ] **Booking Created** → Notify patient + all admins
- [ ] **Booking Status Changed** → Notify patient
- [ ] **Staff Assigned** → Notify staff member + patient
- [ ] **Payment Processed** → Notify patient
- [ ] **Staff Registers** → Notify all admins
- [ ] **Staff Verified/Rejected** → Notify staff member
- [ ] **Service Added/Updated** → Notify all users (optional)

## Current Status

### Database
- 2 Notifications (welcome messages)
- 2 Unread
- 0 Read

### Users
- 1 Admin - has 1 welcome notification
- 1 Patient - has 1 welcome notification

All new registrations will automatically receive a welcome notification.
