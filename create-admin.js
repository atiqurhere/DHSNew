// MongoDB Script to Create Admin User
// Run this in MongoDB Compass or MongoDB Shell

// Option 1: Update existing user to admin
db.users.updateOne(
  { email: "atiqur5535@gmail.com" },
  { $set: { role: "admin", isVerified: true } }
)

// Option 2: Check if admin exists
db.users.findOne({ role: "admin" })

// Option 3: View all users
db.users.find({}, { name: 1, email: 1, role: 1, isVerified: 1 })
