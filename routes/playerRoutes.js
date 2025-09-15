const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const StatLine = require('../models/StatLine');

// Middleware to require login
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}


// Index - list all players
router.get('/', requireAuth, async (req, res) => {
  const allPlayers = await Player.find({}).populate('owner'); // 👈 populate owner
  res.render('players/index.ejs', { 
    players: allPlayers, 
    userId: req.session.userId 
  });
});


// New - show form to create player
router.get('/new', requireAuth, (req, res) => {
  res.render('players/new.ejs', { userId: req.session.userId });
});


// Create - add new player (ties owner to logged-in user)
router.post('/', requireAuth, async (req, res) => {
  const { redirectToTeam, ...playerData } = req.body;
  const newPlayer = await Player.create({
    ...playerData,
    owner: req.session.userId
  });

  if (redirectToTeam) {
    res.redirect(`/teams/${redirectToTeam}`);
  } else {
    res.redirect('/players');
  }
});

// Show - one player detail (with stats)
router.get('/:id', requireAuth, async (req, res) => {
  const foundPlayer = await Player.findById(req.params.id).populate('owner');
  const stats = await StatLine.find({ player: req.params.id });

  res.render('players/show.ejs', { 
    player: foundPlayer, 
    stats, 
    userId: req.session.userId  
  });
});

// Edit - show form to edit player (only owner)
router.get('/:id/edit', requireAuth, async (req, res) => {
  const foundPlayer = await Player.findById(req.params.id);
  if (!foundPlayer || foundPlayer.owner.toString() !== req.session.userId) {
    return res.redirect('/players');
  }
  res.render('players/edit.ejs', { 
    player: foundPlayer, 
    userId: req.session.userId 
  });
});

// Update - update player (only owner)
router.put('/:id', requireAuth, async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (player && player.owner.toString() === req.session.userId) {
    await Player.findByIdAndUpdate(req.params.id, req.body);
  }
  res.redirect(`/players/${req.params.id}`);
});

// Delete - remove player (only owner)
router.delete('/:id', requireAuth, async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (player && player.owner.toString() === req.session.userId) {
    await Player.findByIdAndDelete(req.params.id);
  }
  res.redirect('/players');
});

module.exports = router;



