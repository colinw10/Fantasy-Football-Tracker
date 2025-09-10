const express = require('express');
const router = express.Router();
const Player = require('../models/Player');

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
  await Player.create(req.body);
  res.redirect('/players');
});

// Show - one player detail
router.get('/:id', async (req, res) => {
  const foundPlayer = await Player.findById(req.params.id);
  res.render('players/show.ejs', { player: foundPlayer });
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
