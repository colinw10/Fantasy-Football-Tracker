// Import modules
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const morgan = require('morgan');
const dotenv = require('dotenv');
const session = require('express-session');
const mongo = require('connect-mongo'); 
const statRoutes = require('./routes/statRoutes');
const expressLayouts = require('express-ejs-layouts');




dotenv.config();

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use('/stats', statRoutes);
app.use(expressLayouts);

// EJS view engine
app.set('view engine', 'ejs');

// Sessions (Mongo-backed store)
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  store: mongo.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 } 
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB:', mongoose.connection.name);
});

// Routes
app.get('/', (req, res) => {
  res.send("Football Stat Tracker running ✅");
});

// Import & use routes
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const teamRoutes = require('./routes/teamRoutes');


app.use('/teams', teamRoutes);
app.use('/auth', authRoutes);
app.use('/players', playerRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});

