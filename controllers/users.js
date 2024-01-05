
const router = require('express').Router();
const User = require('../models/user');
const bcrypt = require("bcrypt")

router.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", {
    title: 1,
    author: 1,
    url: 1,
    likes: 1,
  });
  res.status(201).json(users)
});

router.post("/", async (req, res) => {
    const { username, name, password } = req.body;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = newUser.save();
    res.status(201).json(savedUser)

})

module.exports = router