const router = require("express").Router();
const Blog = require("../models/blog");

router.get("/", async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
});

router.post("/", async (req, res, next) => {
  const { title, author, url, likes } = req.body;

  if (!title || !author) {
    return res.status(400).send("Title and author are required.");
  }

  const newBlog = new Blog({
    title,
    author,
    url,
    likes: likes !== undefined ? likes : 0,
  });

  const result = await newBlog.save();
  res.status(201).json(result);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  await Blog.findByIdAndDelete(id);
  res.status(204).end();
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true });
  res.status(201).json(updatedBlog)
})

module.exports = router;
