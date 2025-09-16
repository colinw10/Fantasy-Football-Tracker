const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const RosterSpot = require('../models/RosterSpot');
const Player = require('../models/Player');
const StatLine = require('../models/StatLine'); // 👈 NEW

// Middleware to require login
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  next();
}


// Index - all teams owned by current user + fantasy points leaderboard
router.get('/', requireAuth, async (req, res) => {
  const myTeams = await Team.find({ owner: req.session.userId });

  const teamsWithPoints = [];
  for (let team of myTeams) {
    const roster = await RosterSpot.find({ team: team._id }).populate('player');

    let totalFantasyPoints = 0;
    for (let spot of roster) {
      const latestStat = await StatLine.findOne({ player: spot.player._id })
        .sort({ week: -1 });
      if (latestStat) {
        totalFantasyPoints += latestStat.fantasyPoints || 0;
      }
    }

    teamsWithPoints.push({
      ...team.toObject(),
      totalFantasyPoints
    });
  }

  // Sort leaderboard: highest points first
  teamsWithPoints.sort((a, b) => b.totalFantasyPoints - a.totalFantasyPoints);

  res.render('teams/index.ejs', { teams: teamsWithPoints });
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


// Show - detail of one team (with roster + fantasy points)
router.get('/:id', requireAuth, async (req, res) => {
  const team = await Team.findById(req.params.id).populate('owner');
  if (!team || team.owner._id.toString() !== req.session.userId) {
    return res.redirect('/teams');
  }

  const roster = await RosterSpot.find({ team: req.params.id }).populate('player');
  let totalFantasyPoints = 0;

  // attach latest stat to each player
  for (let spot of roster) {
    const latestStat = await StatLine.findOne({ player: spot.player._id })
      .sort({ week: -1 });
    if (latestStat) {
      spot.player.latestStat = latestStat;
      totalFantasyPoints += latestStat.fantasyPoints || 0;
    }
  }

  // ✅ FIX: only get this user’s players for dropdown
  const allPlayers = await Player.find({ owner: req.session.userId });

  res.render('teams/show.ejs', { team, roster, players: allPlayers, totalFantasyPoints });
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

// Add player to team roster
router.post('/:id/roster', requireAuth, async (req, res) => {
  try {
    if (!req.body.playerId) {
      throw new Error("No player selected");
    }

    // ✅ Prevent adding another user’s player by mistake
    const player = await Player.findOne({ _id: req.body.playerId, owner: req.session.userId });
    if (!player) {
      throw new Error("Player not found or not owned by this user");
    }

    await RosterSpot.create({
      team: req.params.id,
      player: req.body.playerId
    });

    res.redirect(`/teams/${req.params.id}`);
  } catch (err) {
    console.error("Error adding player to roster:", err.message);
    res.redirect(`/teams/${req.params.id}`);
  }
});

// Remove player from team roster
router.delete('/roster/:rosterSpotId', requireAuth, async (req, res) => {
  const spot = await RosterSpot.findById(req.params.rosterSpotId).populate('team');
  if (spot && spot.team.owner.toString() === req.session.userId) {
    await RosterSpot.findByIdAndDelete(req.params.rosterSpotId);
    res.redirect(`/teams/${spot.team._id}`);
  } else {
    res.redirect('/teams');
  }
});

module.exports = router;








