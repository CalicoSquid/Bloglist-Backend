const router = require("express").Router();
const Blog = require("../models/blog");

router.get("/", (req, res) => {
  Blog.find({}).then((blogs) => res.json(blogs));
});

router.post("/", (req, res, next) => {
  const newBlog = new Blog(req.body);
  newBlog
    .save()
    .then((result) => res.status(201).json(result))
    .catch((error) => next(error));
});

module.exports = router;
