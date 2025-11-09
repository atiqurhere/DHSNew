const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendWelcomeNotification, sendStaffApplicationNotification } = require('../utils/notificationHelper');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, address, staffType } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      phone,
      role: role || 'patient',
      address
    };

    // If registering as staff
    if (role === 'staff') {
      userData.staffType = staffType;
      userData.isVerified = false; // Staff needs admin approval
    }

    const user = await User.create(userData);

    if (user) {
      // Send welcome notification
      await sendWelcomeNotification(user._id, user.name, user.role);

      // If staff registration, notify admins
      if (role === 'staff') {
        await sendStaffApplicationNotification(user._id, user.name, staffType || 'Staff');
      }

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        profilePicture: user.profilePicture,
        isVerified: user.isVerified,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if staff is verified
    if (user.role === 'staff' && !user.isVerified) {
      return res.status(403).json({ 
        message: 'Your staff account is pending admin approval' 
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update basic fields
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    // Handle password change
    if (req.body.newPassword) {
      // Verify current password
      if (!req.body.currentPassword) {
        return res.status(400).json({ message: 'Please provide current password' });
      }

      const isMatch = await user.matchPassword(req.body.currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      user.password = req.body.newPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      profilePicture: updatedUser.profilePicture,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile picture
// @route   PUT /api/auth/profile/picture
// @access  Private
exports.updateProfilePicture = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Store the file path (relative to uploads directory)
    user.profilePicture = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
