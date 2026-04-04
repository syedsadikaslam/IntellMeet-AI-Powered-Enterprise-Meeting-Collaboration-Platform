const express = require('express');
const router = express.Router();
const { registerUser, loginUser, refreshAccessToken, logoutUser, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../utils/multer');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

// Example protected route for profile
router.get('/me', protect, (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar: req.user.avatar,
  });
});

module.exports = router;
