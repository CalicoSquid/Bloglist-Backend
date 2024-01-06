const router = require("express").Router();
const blog = require("../models/blog");
const Blog = require("../models/blog");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

router.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  res.json(blogs);
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;

  const blog = await Blog.findById(id);
  blog ? res.json(blog) : res.status(404).end();
});

router.post("/", async (req, res) => {
  const { title, author, url, likes } = req.body;
  const token = req.decodedToken;
  const user = req.user;

  if (!title || !author) {
    return res.status(400).send("Title and author are required.");
  }

  if (!token) {
    return res.status(401).json({ error: "Token missing or invalid" });
  }

  const newBlog = new Blog({
    title,
    author,
    url,
    likes: likes !== undefined ? likes : 0,
    user: user.id,
  });

  const result = await newBlog.save();
  user.blogs = user.blogs.concat(result._id);
  await user.save();
  res.status(201).json(result);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: "Cannot delete blog, Auth required." });
  }

  const blogToDelete = await Blog.findById(id);

  if (blogToDelete.user.toString() != user.id.toString()) {
    return res
      .status(401)
      .json({ error: "Cannot delete blog, Auth required." });
  }

  await Blog.findByIdAndDelete(id);
  res.status(204).json({ message: "Blog succesfully deleted" }).end();
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const user = req.user;

  if (!user) {
    res.status(401).json({ error: "Cannot delete blog, Auth required." });
  }

  const blogToUpdate = await Blog.findById(id);

  if (blogToUpdate.user.toString() != user.id.toString()) {
    return res
      .status(401)
      .json({ error: "Cannot delete blog, Auth required." });
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, body, { new: true });
  res.status(201).json(updatedBlog);
});

module.exports = router;
