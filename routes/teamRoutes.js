const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Middleware to require login
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}

// Index - all teams owned by current user
router.get('/', requireAuth, async (req, res) => {
  const myTeams = await Team.find({ owner: req.session.userId });
  res.render('teams/index.ejs', { teams: myTeams });
});

// New - form to create team
router.get('/new', requireAuth, (req, res) => {
  res.render('teams/new.ejs');
});

// Create - add new team
router.post('/', requireAuth, async (req, res) => {
  await Team.create({ 
    name: req.body.name, 
    leagueName: req.body.leagueName,
    owner: req.session.userId
  });
  res.redirect('/teams');
});

// Show - detail of one team
router.get('/:id', requireAuth, async (req, res) => {
  const team = await Team.findById(req.params.id).populate('owner');
  if (!team || team.owner._id.toString() !== req.session.userId) {
    return res.redirect('/teams');
  }
  res.render('teams/show.ejs', { team });
});

// Edit - form to edit team
router.get('/:id/edit', requireAuth, async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team || team.owner.toString() !== req.session.userId) {
    return res.redirect('/teams');
  }
  res.render('teams/edit.ejs', { team });
});

// Update - update team in DB
router.put('/:id', requireAuth, async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (team.owner.toString() === req.session.userId) {
    await Team.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      leagueName: req.body.leagueName
    });
  }
  res.redirect(`/teams/${req.params.id}`);
});

// Delete - remove team
router.delete('/:id', requireAuth, async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (team.owner.toString() === req.session.userId) {
    await Team.findByIdAndDelete(req.params.id);
  }
  res.redirect('/teams');
});

module.exports = router;


