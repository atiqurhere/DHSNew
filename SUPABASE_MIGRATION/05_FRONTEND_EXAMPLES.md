# Frontend Code Migration Examples

## Complete code examples for migrating React components from MongoDB/Express to Supabase

---

## 1. Authentication Pages

### Login Page Migration

**Before (client/src/pages/Login.jsx with Axios):**
```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('user', JSON.stringify(data))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

**After (with Supabase):**
```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/SupabaseAuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Register Page Migration

**After (with Supabase):**
```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/SupabaseAuthContext'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    address: {}
  })
  const [error, setError] = useState('')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signUp(formData)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

---

## 2. Booking System

### Create Booking

**Before:**
```javascript
const createBooking = async (bookingData) => {
  const { data } = await api.post('/bookings', bookingData)
  return data
}
```

**After:**
```javascript
import { supabase } from '../lib/supabase'

const createBooking = async (bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      patient_id: bookingData.patientId,
      service_id: bookingData.serviceId,
      scheduled_date: bookingData.scheduledDate,
      scheduled_time: bookingData.scheduledTime,
      address: bookingData.address,
      notes: bookingData.notes,
      status: 'pending'
    })
    .select(`
      *,
      service:services(id, name, description, price, category, image),
      patient:users!bookings_patient_id_fkey(id, name, email, phone)
    `)
    .single()

  if (error) throw error
  
  // Send notification (optional)
  await supabase.functions.invoke('email-notification', {
    body: {
      to: data.patient.email,
      subject: 'Booking Created',
      html: `<h1>Booking Confirmed</h1><p>Your booking for ${data.service.name} has been created.</p>`
    }
  })

  return data
}
```

### List Bookings Component

**After:**
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/SupabaseAuthContext'

const MyBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(id, name, price, image, category),
          staff:users!bookings_staff_id_fkey(id, name, phone)
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data)
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const cancelBooking = async (bookingId) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .eq('patient_id', user.id) // Security check

    if (error) {
      console.error('Error cancelling:', error)
    } else {
      fetchBookings() // Refresh
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {bookings.map(booking => (
        <div key={booking.id} className="booking-card">
          <h3>{booking.service.name}</h3>
          <p>Date: {booking.scheduled_date}</p>
          <p>Time: {booking.scheduled_time}</p>
          <p>Status: {booking.status}</p>
          {booking.staff && <p>Staff: {booking.staff.name}</p>}
          {booking.status === 'pending' && (
            <button onClick={() => cancelBooking(booking.id)}>
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 3. Services Management

### Services List with Real-time

**After:**
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const Services = () => {
  const [services, setServices] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchServices()

    // Real-time subscription
    const subscription = supabase
      .channel('services_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setServices(prev => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setServices(prev => 
              prev.map(s => s.id === payload.new.id ? payload.new : s)
            )
          } else if (payload.eventType === 'DELETE') {
            setServices(prev => prev.filter(s => s.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [])

  const fetchServices = async () => {
    let query = supabase
      .from('services')
      .select('*')
      .eq('is_available', true)

    if (filter !== 'all') {
      query = query.eq('category', filter)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching services:', error)
    } else {
      setServices(data)
    }
  }

  return (
    <div>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All Services</option>
        <option value="home-care">Home Care</option>
        <option value="nurse-care">Nurse Care</option>
        <option value="medicine-delivery">Medicine Delivery</option>
        <option value="doctor-on-call">Doctor on Call</option>
        <option value="equipment-rental">Equipment Rental</option>
      </select>

      <div className="services-grid">
        {services.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
```

---

## 4. Notifications System

### Real-time Notifications

**After:**
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/SupabaseAuthContext'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    fetchNotifications()

    // Real-time subscription for new notifications
    const subscription = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
          
          // Show toast notification
          showToast(payload.new.title, payload.new.message)
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [user])

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (!error) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  const markAsRead = async (notificationId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  return (
    <div>
      <div className="notifications-header">
        <h2>Notifications ({unreadCount})</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead}>Mark all as read</button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification ${!notification.is_read ? 'unread' : ''}`}
            onClick={() => markAsRead(notification.id)}
          >
            <h3>{notification.title}</h3>
            <p>{notification.message}</p>
            <span className="timestamp">
              {new Date(notification.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 5. File Upload

### Service Image Upload

**After:**
```javascript
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ServiceForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'home-care',
    price: '',
    image: null
  })
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file) => {
    if (!file) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).slice(2)}.${fileExt}`
    const filePath = `service-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('dhs-uploads')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('dhs-uploads')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      // Upload image first
      let imageUrl = '/images/default-service.jpg'
      if (formData.image) {
        imageUrl = await handleImageUpload(formData.image)
      }

      // Create service
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          image: imageUrl,
          is_available: true
        })
        .select()
        .single()

      if (error) throw error

      alert('Service created successfully!')
    } catch (error) {
      console.error('Error creating service:', error)
      alert('Failed to create service')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Service Name"
        required
      />
      
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Description"
        required
      />
      
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
      >
        <option value="home-care">Home Care</option>
        <option value="nurse-care">Nurse Care</option>
        <option value="medicine-delivery">Medicine Delivery</option>
        <option value="doctor-on-call">Doctor on Call</option>
        <option value="equipment-rental">Equipment Rental</option>
      </select>
      
      <input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        placeholder="Price"
        required
      />
      
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
      />
      
      <button type="submit" disabled={uploading}>
        {uploading ? 'Creating...' : 'Create Service'}
      </button>
    </form>
  )
}
```

---

## 6. Support Tickets

### Create Support Ticket

**After:**
```javascript
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/SupabaseAuthContext'

const CreateTicket = () => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  })
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          category: formData.category,
          priority: formData.priority,
          status: 'open',
          messages: [{
            sender: user.id,
            senderRole: 'user',
            message: formData.message,
            isRead: false,
            createdAt: new Date().toISOString()
          }],
          last_response_by: 'user',
          last_response_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      alert(`Ticket created! Ticket #: ${data.ticket_number}`)
      
      // Navigate to ticket view
      // navigate(`/support/tickets/${data.id}`)
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Ticket Chat with Real-time

**After:**
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/SupabaseAuthContext'
import { useParams } from 'react-router-dom'

const TicketChat = () => {
  const [ticket, setTicket] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const { ticketId } = useParams()
  const { user } = useAuth()

  useEffect(() => {
    fetchTicket()

    // Real-time subscription
    const subscription = supabase
      .channel(`ticket:${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${ticketId}`
        },
        (payload) => {
          setTicket(payload.new)
        }
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [ticketId])

  const fetchTicket = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:users!support_tickets_user_id_fkey(name, email),
        assigned_to_user:users!support_tickets_assigned_to_fkey(name, email)
      `)
      .eq('id', ticketId)
      .single()

    if (!error) setTicket(data)
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const updatedMessages = [
      ...(ticket.messages || []),
      {
        sender: user.id,
        senderRole: user.role === 'admin' ? 'admin' : 'user',
        message: newMessage,
        isRead: false,
        createdAt: new Date().toISOString()
      }
    ]

    const { error } = await supabase
      .from('support_tickets')
      .update({
        messages: updatedMessages,
        last_response_at: new Date().toISOString(),
        last_response_by: user.role === 'admin' ? 'admin' : 'user',
        status: user.role === 'admin' ? 'waiting-user' : 'waiting-admin'
      })
      .eq('id', ticketId)

    if (!error) {
      setNewMessage('')
    }
  }

  if (!ticket) return <div>Loading...</div>

  return (
    <div className="ticket-chat">
      <div className="ticket-header">
        <h2>{ticket.subject}</h2>
        <span className="ticket-number">{ticket.ticket_number}</span>
        <span className={`status status-${ticket.status}`}>{ticket.status}</span>
      </div>

      <div className="messages">
        {ticket.messages?.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.senderRole === 'admin' ? 'admin' : 'user'}`}
          >
            <div className="message-content">{msg.message}</div>
            <div className="message-time">
              {new Date(msg.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && (
        <div className="message-input">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      )}
    </div>
  )
}
```

---

## 7. Admin Dashboard

### Admin Stats

**After:**
```javascript
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    activeStaff: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    // Get booking stats
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })

    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get revenue
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'completed')

    const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0

    // Get user stats
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: activeStaff } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'staff')
      .eq('is_verified', true)
      .eq('availability', 'available')

    setStats({
      totalBookings,
      pendingBookings,
      totalRevenue,
      totalUsers,
      activeStaff
    })
  }

  return (
    <div className="dashboard">
      <div className="stat-card">
        <h3>Total Bookings</h3>
        <p>{stats.totalBookings}</p>
      </div>
      <div className="stat-card">
        <h3>Pending Bookings</h3>
        <p>{stats.pendingBookings}</p>
      </div>
      <div className="stat-card">
        <h3>Total Revenue</h3>
        <p>৳{stats.totalRevenue.toFixed(2)}</p>
      </div>
      <div className="stat-card">
        <h3>Total Users</h3>
        <p>{stats.totalUsers}</p>
      </div>
      <div className="stat-card">
        <h3>Active Staff</h3>
        <p>{stats.activeStaff}</p>
      </div>
    </div>
  )
}
```

---

## Common Patterns Summary

### Query Patterns
```javascript
// SELECT ALL
const { data } = await supabase.from('table').select()

// SELECT WITH FILTER
const { data } = await supabase.from('table').select().eq('field', value)

// SELECT WITH JOIN
const { data } = await supabase.from('table').select('*, related_table(*)')

// INSERT
const { data } = await supabase.from('table').insert(values).select().single()

// UPDATE
const { data } = await supabase.from('table').update(values).eq('id', id)

// DELETE
const { error } = await supabase.from('table').delete().eq('id', id)

// COUNT
const { count } = await supabase.from('table').select('*', { count: 'exact', head: true })
```

### Error Handling
```javascript
const { data, error } = await supabase.from('table').select()

if (error) {
  console.error('Error:', error.message)
  // Handle error
} else {
  // Use data
}
```

---

## Next Steps

1. Replace all `api.get/post/put/delete` calls with Supabase queries
2. Implement real-time subscriptions where needed
3. Add proper error handling
4. Test all features thoroughly
5. Deploy to Vercel
