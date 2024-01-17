const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  const pwCorrect = !user
    ? false
    : await bcrypt.compare(password, user.passwordHash);

  if (!(user && pwCorrect)) {
    return res.status(401).json({
      error: "invalid username or password",
    });
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  };

  const token = jwt.sign(userForToken, process.env.SECRET, {
    expiresIn: 60 * 60,
  });

  res
    .status(200)
    .send({ token, username: user.username, name: user.name, id: user._id });
});

module.exports = router;
