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
    const { username, password } = req.body;

    // Create user
    const user = new User({ username, password });
    await user.save();

    // Store user ID in session
    req.session.userId = user._id;

    res.redirect('/teams');
  } catch (err) {
    console.error(err);
    res.redirect('/auth/signup'); // fallback if something goes wrong
  }
});

// Login form
router.get('/login', (req, res) => {
  res.render('auth/login', { title: "Login" });
});

// Handle login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.redirect('/auth/login'); // invalid username
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.redirect('/auth/login'); // invalid password
    }

    // Login successful
    req.session.userId = user._id;
    res.redirect('/teams');
  } catch (err) {
    console.error(err);
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

