/**
 * COMPREHENSIVE API MIGRATION GUIDE
 * 
 * Use this as reference when updating components manually
 * Or use find/replace patterns below
 */

// =================== AUTH UPDATES ===================
// OLD: const { user, login, register, logout } = useAuth();
// NEW: const { user, signIn, signUp, signOut } = useAuth();

// OLD: await login(email, password);
// NEW: await signIn(email, password);

// OLD: await register(userData);
// NEW: await signUp(userData);

// OLD: await logout();
// NEW: await signOut();

// =================== API CALL UPDATES ===================

// ============= SERVICES =============
// OLD: await api.get('/services')
// NEW: await servicesAPI.getAll()

// OLD: await api.get(`/services/${id}`)
// NEW: await servicesAPI.getById(id)

// OLD: await api.post('/services', data)
// NEW: await servicesAPI.create(data)

// OLD: await api.put(`/services/${id}`, data)
// NEW: await servicesAPI.update(id, data)

// OLD: await api.delete(`/services/${id}`)
// NEW: await servicesAPI.delete(id)

// ============= BOOKINGS =============
// OLD: await api.get('/bookings')
// NEW: await bookingsAPI.getAll()

// OLD: await api.get('/bookings/my-bookings')
// NEW: await bookingsAPI.getByUser(user.id)

// OLD: await api.get(`/bookings/${id}`)
// NEW: await bookingsAPI.getById(id)

// OLD: await api.post('/bookings', data)
// NEW: await bookingsAPI.create(data)

// OLD: await api.put(`/bookings/${id}/status`, { status })
// NEW: await bookingsAPI.update(id, { status })

// OLD: await api.put(`/bookings/${id}/cancel`, { reason })
// NEW: await bookingsAPI.cancel(id, reason)

// ============= PAYMENTS =============
// OLD: await api.get('/payments')
// NEW: await paymentsAPI.getAll()

// OLD: await api.post('/payments', data)
// NEW: await paymentsAPI.create(data)

// OLD: await api.put(`/payments/${id}/status`, { status })
// NEW: await paymentsAPI.updateStatus(id, status)

// ============= NOTIFICATIONS =============
// OLD: await api.get('/notifications')
// NEW: await notificationsAPI.getByUser(user.id)

// OLD: await api.put(`/notifications/${id}/read`)
// NEW: await notificationsAPI.markAsRead(id)

// OLD: await api.put('/notifications/mark-all-read')
// NEW: await notificationsAPI.markAllAsRead(user.id)

// OLD: await api.delete(`/notifications/${id}`)
// NEW: await notificationsAPI.delete(id)

// REAL-TIME SUBSCRIPTION (NEW!)
// const subscription = notificationsAPI.subscribe(user.id, (notification) => {
//   // Handle new notification
// });
// // Cleanup: subscription.unsubscribe();

// ============= SUPPORT TICKETS =============
// OLD: await api.get('/support/tickets')
// NEW: await supportAPI.getByUser(user.id)

// OLD: await api.get('/support/tickets/admin/all')
// NEW: await supportAPI.getAll()

// OLD: await api.get(`/support/tickets/${id}`)
// NEW: await supportAPI.getById(id)

// OLD: await api.post('/support/tickets', data)
// NEW: await supportAPI.create(data)

// OLD: await api.put(`/support/tickets/${id}/status`, { status })
// NEW: await supportAPI.update(id, { status })

// OLD: await api.post(`/support/tickets/${id}/messages`, { message })
// NEW: await supportAPI.addResponse(id, user.id, message)

// ============= CHATBOT =============
// OLD: await api.post('/chatbot/chat', { message })
// NEW: await chatbotAPI.getResponse(message)

// ============= FILE UPLOAD =============
// OLD: const formData = new FormData(); formData.append('file', file); 
//      await api.post('/upload', formData)
// NEW: await uploadAPI.uploadFile(file, 'uploads')

// OLD: await api.delete(`/upload/${filename}`)
// NEW: await uploadAPI.deleteFile(filename, 'uploads')

// ============= ADMIN - USERS =============
// OLD: await api.get('/admin/users')
// NEW: await adminAPI.getAllUsers()

// OLD: await api.get('/admin/staff')
// NEW: const { data } = await adminAPI.getAllUsers();
//      data.filter(u => u.role === 'staff')

// OLD: await api.put(`/admin/staff/${id}/verify`)
// NEW: await adminAPI.verifyStaff(id)

// OLD: await api.put(`/admin/users/${id}`, updates)
// NEW: await adminAPI.updateUser(id, updates)

// OLD: await api.delete(`/admin/users/${id}`)
// NEW: await adminAPI.deleteUser(id)

// ============= ADMIN - STATS =============
// OLD: await api.get('/admin/stats')
// NEW: await adminAPI.getStats()

// ============= PAGE CONTENT =============
// OLD: await api.get('/pages/about')
// NEW: await pagesAPI.getBySlug('about')

// OLD: await api.put(`/pages/${id}`, data)
// NEW: await pagesAPI.update(id, data)

// =================== FIELD NAME CHANGES ===================
// MongoDB field -> Supabase field
// _id -> id
// createdAt -> created_at
// updatedAt -> updated_at
// isRead -> is_read
// isActive -> is_active
// isVerified -> is_verified
// staffType -> staff_type
// patientId -> patient_id
// serviceId -> service_id
// staffId -> staff_id
// bookingId -> booking_id
// userId -> user_id
// relatedId -> related_id
// relatedModel -> related_model
// verificationStatus -> verification_status

// =================== IMPORT STATEMENTS ===================
// Add to component imports:
import { 
  authAPI, 
  servicesAPI, 
  bookingsAPI, 
  paymentsAPI, 
  notificationsAPI, 
  supportAPI, 
  chatbotAPI, 
  uploadAPI, 
  adminAPI, 
  pagesAPI 
} from '../utils/supabaseAPI';

// =================== ERROR HANDLING ===================
// Supabase returns { data, error } not try/catch axios
// OLD:
// try {
//   const { data } = await api.get('/endpoint');
//   // use data
// } catch (error) {
//   console.error(error);
// }

// NEW:
// const { data, error } = await servicesAPI.getAll();
// if (error) {
//   console.error(error);
//   toast.error(error);
//   return;
// }
// use data

// =================== PROFILE PICTURE UPLOAD ===================
// OLD: 
// const formData = new FormData();
// formData.append('profilePicture', file);
// await api.put('/auth/profile/picture', formData);

// NEW:
// const { data, error } = await uploadAPI.uploadFile(file, 'profile-pictures');
// if (!error) {
//   await authAPI.updateProfile(user.id, { profile_picture: data.url });
// }

export {};
