const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  leagueName: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // reference to logged-in user
});

module.exports = mongoose.model('Team', teamSchema);
