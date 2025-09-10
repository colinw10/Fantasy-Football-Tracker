const express = require('express');
const router = express.Router();
const StatLine = require('../models/StatLine');
const Player = require('../models/Player');

// New - form to create statline
router.get('/new', async (req, res) => {
  const players = await Player.find({});
  res.render('stats/new.ejs', { players });
});

// Create - add new statline
router.post('/', async (req, res) => {
  await StatLine.create(req.body);
  res.redirect('/players'); // after adding stats, send back to players list
});

// Edit - form to edit statline
router.get('/:id/edit', async (req, res) => {
  const stat = await StatLine.findById(req.params.id).populate('player');
  res.render('stats/edit.ejs', { stat });
});

// Update - update statline in DB
router.put('/:id', async (req, res) => {
  await StatLine.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/players');
});

// Delete - remove statline
router.delete('/:id', async (req, res) => {
  await StatLine.findByIdAndDelete(req.params.id);
  res.redirect('/players');
});

module.exports = router;
