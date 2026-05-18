const express = require('express');
const router = express.Router();

const { getUsers, updateUserRole } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;