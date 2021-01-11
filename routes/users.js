const express = require('express');
const { getUser } = require('../controllers/users');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getUser);

module.exports = router;
