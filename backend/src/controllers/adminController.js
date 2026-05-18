const User = require('../models/User');
const Photo = require('../models/Photo');
const mongoose = require('mongoose');

// @desc    Get all users with their upload counts
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').lean();
    
    // Get upload counts for each user
    const usersWithCounts = await Promise.all(users.map(async (user) => {
      const uploadCount = await Photo.countDocuments({ user: user._id });
      return {
        ...user,
        totalUploads: uploadCount
      };
    }));

    res.json(usersWithCounts);
  } catch (error) {
    console.error('GET USERS ERROR:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't allow removing own admin role if needed, but for now just update
    user.role = role || user.role;
    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error('UPDATE ROLE ERROR:', error);
    return res.status(500).json({ error: error.message || 'Server error' });
  }
};

module.exports = {
  getUsers,
  updateUserRole,
};
