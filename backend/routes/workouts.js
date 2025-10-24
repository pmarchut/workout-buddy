const express = require('express');
const Workout = require('../models/workoutModel');

const router = express.Router();

// GET all workouts
router.get('/', (req, res) => {
    res.json({ message: 'Get all workouts' });
});

// GET a single workout
router.get('/:id', (req, res) => {
    res.json({ message: 'Get a single workout' });
});

// POST a new workout
router.post('/', async (req, res) => {
    const { title, reps, load } = req.body;

    try {
        const workout = await Workout.create({ title, reps, load });
        res.status(201).json(workout);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE a workout
router.delete('/:id', (req, res) => {
    res.json({ message: 'Delete a workout' });
});

// UPDATE a workout
router.patch('/:id', (req, res) => {
    res.json({ message: 'Update a workout' });
});

module.exports = router;