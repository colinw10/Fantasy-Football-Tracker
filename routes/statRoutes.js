const express = require('express');
const router = express.Router();
const StatLine = require('../models/StatLine');
const Player = require('../models/Player');

// Index - list all statlines
router.get('/', async (req, res) => {
  const stats = await StatLine.find({}).populate('player');
  res.render('stats/index.ejs', { stats, title: "All Stats" });
});

// New - form to create a statline
router.get('/new', async (req, res) => {
  const players = await Player.find({});
  res.render('stats/new.ejs', { players, title: "Add Stats" });
});

// Create - add new statline
router.post('/', async (req, res) => {
  await StatLine.create(req.body);
  res.redirect(`/players/${req.body.player}`); // go back to player show page
});

// Edit - form to edit statline
router.get('/:id/edit', async (req, res) => {
  const stat = await StatLine.findById(req.params.id).populate('player');
  res.render('stats/edit.ejs', { stat, title: `Edit Stats for ${stat.player.name}` });
});

// Update - update statline in DB
router.put('/:id', async (req, res) => {
  const stat = await StatLine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.redirect(`/players/${stat.player}`);
});

// Delete - remove statline
router.delete('/:id', async (req, res) => {
  const stat = await StatLine.findById(req.params.id);
  if (stat) {
    await StatLine.findByIdAndDelete(req.params.id);
    res.redirect(`/players/${stat.player}`);
  } else {
    res.redirect('/players');
  }
});

module.exports = router;