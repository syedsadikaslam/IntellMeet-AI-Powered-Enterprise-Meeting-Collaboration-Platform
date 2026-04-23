const User = require('../models/User');
const generateTokens = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use build + manual token addition to avoid double save
    const user = new User({ name, email, password });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push(refreshToken);
    
    await user.save();

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('REGISTRATION_ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      const { accessToken, refreshToken } = generateTokens(user._id);
      
      // Store refreshToken in database
      user.refreshTokens.push(refreshToken);
      await user.save();

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('LOGIN_ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Check if token exists in any user's refreshTokens array
    const user = await User.findOne({ refreshTokens: refreshToken });
    if (!user) {
      return res.status(403).json({ message: 'Invalid or revoked refresh token' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Expired refresh token' });
      }

      // Generate new access token
      const tokens = generateTokens(user._id);
      res.json({ accessToken: tokens.accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user & revoke token
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user._id);
    
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      await user.save();
      res.json({ message: 'Logged out successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cloudinary = require('../utils/cloudinaryConfig');

// @desc    Update user profile (avatar)
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    console.log(`[PROFILE_UPDATE] Request for user ID: ${req.user._id}`);
    console.log('[PROFILE_UPDATE] File metadata:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      available_keys: Object.keys(req.file)
    } : 'No file attached');

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (req.body.name) user.name = req.body.name;
    if (req.body.email) user.email = req.body.email;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.body.jobTitle !== undefined) user.jobTitle = req.body.jobTitle;
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.phoneNumber !== undefined) user.phoneNumber = req.body.phoneNumber;
    
    if (req.file) {
      console.log('[CLOUDINARY] Processing file for upload...');
      
      try {
        // Validate keys
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          console.error('[CLOUDINARY] MISSING CONFIG:', {
            name: !!process.env.CLOUDINARY_CLOUD_NAME,
            key: !!process.env.CLOUDINARY_API_KEY,
            secret: !!process.env.CLOUDINARY_API_SECRET
          });
          throw new Error('Cloudinary configuration is incomplete on the server.');
        }

        // Convert file to buffer (handle different multer versions)
        let buffer;
        if (req.file.buffer) {
          buffer = req.file.buffer;
        } else if (req.file.stream) {
          // If it's a stream, we need to collect it into a buffer
          console.log('[CLOUDINARY] Collecting stream into buffer...');
          const chunks = [];
          for await (const chunk of req.file.stream) {
            chunks.push(chunk);
          }
          buffer = Buffer.concat(chunks);
        } else if (req.file.path) {
          // If it's on disk
          const fs = require('fs');
          buffer = fs.readFileSync(req.file.path);
        }

        if (!buffer) {
          console.error('[CLOUDINARY] Could not find file data in req.file. Keys:', Object.keys(req.file));
          throw new Error('File data is missing or empty.');
        }

        const fileContent = buffer.toString('base64');
        const fileUri = `data:${req.file.mimetype};base64,${fileContent}`;

        console.log('[CLOUDINARY] Uploading to cloud...');
        const uploadResponse = await cloudinary.uploader.upload(fileUri, {
          folder: 'avatars',
          resource_type: 'auto'
        });

        console.log('[CLOUDINARY] Success:', uploadResponse.secure_url);
        user.avatar = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('[PROFILE_UPDATE] Upload Error:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload image to cloud storage', 
          error: uploadError.message,
          hint: 'Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in environment variables.'
        });
      }
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    console.log('[PROFILE_UPDATE] User saved successfully');

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      jobTitle: updatedUser.jobTitle,
      location: updatedUser.location,
      phoneNumber: updatedUser.phoneNumber,
    });

  } catch (error) {
    console.error('[PROFILE_UPDATE] Global error:', error);
    res.status(500).json({ 
      message: 'An internal server error occurred while updating profile', 
      error: error.message 
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateUserProfile,
};
