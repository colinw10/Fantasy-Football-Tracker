const mongoose = require('mongoose');

const rosterSpotSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  acquiredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RosterSpot', rosterSpotSchema);
