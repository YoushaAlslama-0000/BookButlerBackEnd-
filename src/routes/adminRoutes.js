const express = require('express');
const router = express.Router();
const { loginSuperAdmin, getDashboardStats } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/authMiddleware');

router.post('/login', loginSuperAdmin);
router.get('/dashboard', protectAdmin, getDashboardStats);

module.exports = router;
