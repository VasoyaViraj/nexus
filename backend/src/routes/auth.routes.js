import express from 'express';
import User from '../models/User.model.js';
import { generateToken, verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Register a new citizen
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and name are required.'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        // Create new citizen user
        const user = new User({
            email,
            password,
            name,
            role: 'CITIZEN'
        });

        await user.save();

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        // Find user by email
        const user = await User.findOne({ email }).populate('departmentId');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Contact admin.'
            });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const token = generateToken(user._id, user.role);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('departmentId');
        res.json({
            success: true,
            data: { user: user.toJSON() }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user info.'
        });
    }
});

export default router;
