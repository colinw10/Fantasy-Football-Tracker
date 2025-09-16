const mongoose = require('mongoose');

const statLineSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  week: { type: Number, required: true },
  passingYards: Number,
  rushingYards: Number,
  receivingYards: Number,
  touchdowns: Number,
  carries: Number,
  receptions: Number,
  projectedStats: String,
  fantasyPoints: { type: Number, default: 0 },  
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('StatLine', statLineSchema);



