const User = require('../models/userModel');

// login user
const loginUser = (req, res) => {
    res.json({ msg: 'login user' });
}

// signup user
const signupUser = (req, res) => {
    res.json({ msg: 'signup user' });
}

module.exports = { loginUser, signupUser };