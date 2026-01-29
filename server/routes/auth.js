const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const passport = require('passport');
const { protect } = require('../middleware/auth'); // Corrected path

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        const token = generateToken(req.user._id);
        res.redirect(`http://localhost:5173/dashboard?token=${token}`);
    }
);

const { sendWelcomeEmail, sendLoginAlert } = require('../services/emailService');

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            res.json({
                _id: user._id,
                email: user.email,
                username: user.username,
                bio: user.bio,
                profilePicture: user.profilePicture,
                phoneNumber: user.phoneNumber,
                location: user.location,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
        });

        if (user) {
            // Send Welcome Email (Non-blocking)
            sendWelcomeEmail(user.email, user.username || 'Explorer');

            res.status(201).json({
                _id: user._id,
                email: user.email,
                username: user.username,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const multer = require('multer');
const Document = require('../models/Document');

// Multer for Avatar (Images only)
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `avatar-${req.user.id}-${Date.now()}.${file.mimetype.split('/')[1]}`);
    },
});

const uploadAvatar = multer({
    storage,
    fileFilter: function (req, file, cb) {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, true);
    },
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.username = req.body.username || user.username;
            user.bio = req.body.bio || user.bio;
            user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
            user.location = req.body.location || user.location;

            // Handle profile picture URL update (if sent as string, e.g. external or previously uploaded)
            if (req.body.profilePicture) {
                user.profilePicture = req.body.profilePicture;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username,
                bio: updatedUser.bio,
                profilePicture: updatedUser.profilePicture,
                phoneNumber: updatedUser.phoneNumber,
                location: updatedUser.location,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Upload profile picture
// @route   POST /api/auth/avatar
// @access  Private
router.post('/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user && req.file) {
            // In a real app, upload to S3/Cloudinary. Here we serve locally.
            // Assumption: 'uploads' directory is served statically or we return relative path
            // user.profilePicture = `/uploads/${req.file.filename}`; // Adjusted for static serve
            // Since we serve static files from root or specific route, we assume usage:
            user.profilePicture = `http://localhost:5000/uploads/${req.file.filename}`;

            await user.save();

            res.json({
                message: 'Avatar uploaded',
                profilePicture: user.profilePicture
            });
        } else {
            res.status(400).json({ message: 'No file uploaded' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get user history
// @route   GET /api/auth/history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const docs = await Document.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(10);
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                username: user.username,
                bio: user.bio,
                profilePicture: user.profilePicture, // Return these on login too
                token: generateToken(user._id),
            });
            // Send Login Alert (Non-blocking)
            sendLoginAlert(user.email, user.username || 'Explorer');
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
