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

// Automatically calculate fantasy points before save
statLineSchema.pre('save', function (next) {
  const passingYards = this.passingYards || 0;
  const rushingYards = this.rushingYards || 0;
  const receivingYards = this.receivingYards || 0;
  const touchdowns = this.touchdowns || 0;
  const receptions = this.receptions || 0;

  this.fantasyPoints =
    (passingYards / 25) +
    (rushingYards / 10) +
    (receivingYards / 10) +
    (touchdowns * 6) +
    (receptions * 1);

  next();
});

// Recalculate fantasy points when using findOneAndUpdate
statLineSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();

  const passingYards = Number(update.passingYards) || 0;
  const rushingYards = Number(update.rushingYards) || 0;
  const receivingYards = Number(update.receivingYards) || 0;
  const touchdowns = Number(update.touchdowns) || 0;
  const receptions = Number(update.receptions) || 0;

  update.fantasyPoints =
    (passingYards / 25) +
    (rushingYards / 10) +
    (receivingYards / 10) +
    (touchdowns * 6) +
    (receptions * 1);

  this.setUpdate(update);
  next();
});

module.exports = mongoose.model('StatLine', statLineSchema);


