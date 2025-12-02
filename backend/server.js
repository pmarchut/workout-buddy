require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const workoutsRoutes = require('./routes/workouts');
const usersRoutes = require('./routes/users');
const cors = require('cors')

// express app
const app = express();

app.use(cors({
  origin: process.env.FRONT_ORIGIN,
}))

// middleware
app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
})

// routes
app.use('/api/workouts', workoutsRoutes);
app.use('/api/users', usersRoutes);

// connect to db
mongoose.connect(process.env.MONG_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening for requests on port', process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
