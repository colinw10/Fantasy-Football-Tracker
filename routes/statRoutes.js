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

// Helper function to calculate fantasy points
function calculateFantasyPoints({ passingYards = 0, rushingYards = 0, receivingYards = 0, touchdowns = 0, receptions = 0 }) {
  return (
    (passingYards / 25) +    // 1 pt per 25 passing yards
    (rushingYards / 10) +    // 1 pt per 10 rushing yards
    (receivingYards / 10) +  // 1 pt per 10 receiving yards
    (touchdowns * 6) +       // 6 pts per TD
    (receptions * 1)         // 1 pt per reception (PPR)
  );
}

// Index - list all statlines
router.get('/', requireAuth, async (req, res) => {
  const stats = await StatLine.find({})
    .populate('player')
    .populate('owner');

  res.render('stats/index.ejs', { 
    stats, 
    title: "All Stats", 
    userId: req.session.userId   
  });
});

// New - form to create a statline
router.get('/new', requireAuth, async (req, res) => {
  const players = await Player.find({});
  res.render('stats/new.ejs', { players, title: "Add Stats", userId: req.session.userId });
});

// Create - add new statline (auto-calc fantasy points + owner)
router.post('/', requireAuth, async (req, res) => {
  const { passingYards, rushingYards, receivingYards, touchdowns, carries, receptions, projectedStats, player, week } = req.body;

  const fantasyPoints = calculateFantasyPoints({
    passingYards: Number(passingYards),
    rushingYards: Number(rushingYards),
    receivingYards: Number(receivingYards),
    touchdowns: Number(touchdowns),
    receptions: Number(receptions)
  });

  await StatLine.create({
    player,
    week,
    passingYards,
    rushingYards,
    receivingYards,
    touchdowns,
    carries,
    receptions,
    projectedStats,
    fantasyPoints, 
    owner: req.session.userId
  });

  res.redirect(`/players/${player}`);
});

// Edit - form to edit statline (only owner)
router.get('/:id/edit', requireAuth, async (req, res) => {
  const stat = await StatLine.findById(req.params.id).populate('player').populate('owner');
  if (!stat || stat.owner.toString() !== req.session.userId) {
    return res.redirect('/stats');
  }
  res.render('stats/edit.ejs', { stat, title: `Edit Stats for ${stat.player.name}`, userId: req.session.userId });
});

// Update - update statline (auto-calc fantasy points + only owner)
router.put('/:id', requireAuth, async (req, res) => {
  const stat = await StatLine.findById(req.params.id);
  if (stat && stat.owner.toString() === req.session.userId) {
    const { passingYards, rushingYards, receivingYards, touchdowns, carries, receptions, projectedStats, week } = req.body;

    const fantasyPoints = calculateFantasyPoints({
      passingYards: Number(passingYards),
      rushingYards: Number(rushingYards),
      receivingYards: Number(receivingYards),
      touchdowns: Number(touchdowns),
      receptions: Number(receptions)
    });

    await StatLine.findByIdAndUpdate(req.params.id, {
      week,
      passingYards,
      rushingYards,
      receivingYards,
      touchdowns,
      carries,
      receptions,
      projectedStats,
      fantasyPoints 
    });
  }
  res.redirect(`/players/${stat.player}`);
});

// Delete - remove statline (only owner)
router.delete('/:id', requireAuth, async (req, res) => {
  const stat = await StatLine.findById(req.params.id);
  if (stat && stat.owner.toString() === req.session.userId) {
    await StatLine.findByIdAndDelete(req.params.id);
    return res.redirect(`/players/${stat.player}`);
  }
  res.redirect('/players');
});

module.exports = router;


