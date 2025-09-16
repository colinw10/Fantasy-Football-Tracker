const express = require('express');
const router = express.Router();
const StatLine = require('../models/StatLine');
const Player = require('../models/Player');

// Middleware to require login
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

// Index - list all stats for current user
router.get('/', requireAuth, async (req, res) => {
  const stats = await StatLine.find({ owner: req.session.userId })
    .populate('player');
  res.render('stats/index.ejs', { stats, userId: req.session.userId });
});

// New - form to add new stat line
router.get('/new', requireAuth, async (req, res) => {
  // Only show players owned by this user
  const players = await Player.find({ owner: req.session.userId });
  res.render('stats/new.ejs', { players, userId: req.session.userId });
});

// Create - add new stat line
router.post('/', requireAuth, async (req, res) => {
  try {
    const stat = new StatLine({
      ...req.body,
      owner: req.session.userId
    });
    await stat.save();
    res.redirect('/stats');
  } catch (err) {
    console.error("Error creating stat:", err);
    res.redirect('/stats/new');
  }
});

// Edit - show form to edit stat (only owner)
router.get('/:id/edit', requireAuth, async (req, res) => {
  const stat = await StatLine.findById(req.params.id).populate('player');
  if (!stat || stat.owner.toString() !== req.session.userId) {
    return res.redirect('/stats');
  }

  // Only allow editing players owned by this user
  const players = await Player.find({ owner: req.session.userId });
  res.render('stats/edit.ejs', { stat, players, userId: req.session.userId });
});

// Update - update stat (only owner)
router.put('/:id', requireAuth, async (req, res) => {
  const stat = await StatLine.findById(req.params.id);
  if (stat && stat.owner.toString() === req.session.userId) {
    await StatLine.findByIdAndUpdate(req.params.id, req.body);
  }
  res.redirect('/stats');
});

// Delete - remove stat (only owner)
router.delete('/:id', requireAuth, async (req, res) => {
  const stat = await StatLine.findById(req.params.id);
  if (stat && stat.owner.toString() === req.session.userId) {
    await StatLine.findByIdAndDelete(req.params.id);
  }
  res.redirect('/stats');
});

module.exports = router;



