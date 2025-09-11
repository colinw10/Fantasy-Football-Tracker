const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const StatLine = require('../models/StatLine'); // NEW

// Index - list all players
router.get('/', async (req, res) => {
  const allPlayers = await Player.find({});
  res.render('players/index.ejs', { players: allPlayers });
});

// New - show form to create player
router.get('/new', (req, res) => {
  res.render('players/new.ejs');
});

// Create - add new player
router.post('/', async (req, res) => {
  const { redirectToTeam, ...playerData } = req.body;
  const newPlayer = await Player.create(playerData);

  if (redirectToTeam) {
    // If the request came from a team page, redirect back there
    res.redirect(`/teams/${redirectToTeam}`);
  } else {
    res.redirect('/players');
  }
});


// Show - one player detail (with stats)
router.get('/:id', async (req, res) => {
  const foundPlayer = await Player.findById(req.params.id);
  const stats = await StatLine.find({ player: req.params.id }); // NEW
  res.render('players/show.ejs', { player: foundPlayer, stats });
});

// Edit - show form to edit player
router.get('/:id/edit', async (req, res) => {
  const foundPlayer = await Player.findById(req.params.id);
  res.render('players/edit.ejs', { player: foundPlayer });
});

// Update - update player
router.put('/:id', async (req, res) => {
  await Player.findByIdAndUpdate(req.params.id, req.body);
  res.redirect(`/players/${req.params.id}`);
});

// Delete - remove player
router.delete('/:id', async (req, res) => {
  await Player.findByIdAndDelete(req.params.id);
  res.redirect('/players');
});

module.exports = router;

