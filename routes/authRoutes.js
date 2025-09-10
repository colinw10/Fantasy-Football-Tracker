const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Signup form
router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

// Handle signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  await user.save();
  req.session.userId = user._id;
  res.redirect('/teams'); 
});

// Login form
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.comparePassword(password)) {
    req.session.userId = user._id;
    res.redirect('/teams');
  } else {
    res.redirect('/auth/login'); // could flash an error later
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
