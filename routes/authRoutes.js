const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Signup form
router.get('/signup', (req, res) => {
  res.render('auth/signup', { title: "Sign Up" });
});

// Handle signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("❌ Email already exists");
      return res.redirect('/auth/signup');
    }

    // Create new user (password will be hashed in the User model pre-save hook)
    const user = new User({ email, password });
    await user.save();

    // Store user ID in session
    req.session.userId = user._id;

    // Redirect to teams page after signup
    res.redirect('/teams');
  } catch (err) {
    console.error("Signup error:", err);
    res.redirect('/auth/signup');
  }
});

// Login form
router.get('/login', (req, res) => {
  res.render('auth/login', { title: "Login" });
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Invalid email");
      return res.redirect('/auth/login');
    }

    // Compare password with hashed one in DB
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("❌ Invalid password");
      return res.redirect('/auth/login');
    }

    // Login successful → store userId in session
    req.session.userId = user._id;
    res.redirect('/teams');
  } catch (err) {
    console.error("Login error:", err);
    res.redirect('/auth/login');
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;




