const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const api = supertest(app);

const Blog = require("../models/blog");
const helper = require("./test-helper");
const blogList = helper.blogs;

let authToken;

beforeAll(async () => {
  authToken = await helper.loginUser(api, {
    username: "test-user",
    password: "test-password",
  });
});

beforeEach(async () => {
  await Blog.deleteMany({});

  const users = await helper.getAllUsers();
  
  const user = users[0].id
  for (let blog of blogList) {
    const newBlog = new Blog({ ...blog, user });
    await newBlog.save();
  }
});


describe("Tests to check properties and actions of current blogs in database", () => {
  test("GET returns correct number of blogs", async () => {
    const listOfBlogsBefore = await helper.getAllBlogs();

    const blogs = await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(blogs.body.length).toEqual(listOfBlogsBefore.length);
  });

  test("Database ID property is correctly named 'id'", async () => {
    const listOfAllBlogs = await helper.getAllBlogs();

    listOfAllBlogs.forEach((blog) => {
      expect(blog.id).toBeDefined();
      expect(blog._id).not.toBeDefined();
    });
  });

  test("Check if DELETE removes item from database", async () => {
    const listOfAllBlogs = await helper.getAllBlogs();
    const blogToDelete = listOfAllBlogs[0].id;
    
    await api
      .delete(`/api/blogs/${blogToDelete}`)
      .set("authorization", authToken)
      .expect(204);

    const listOfAllBlogsAfter = await helper.getAllBlogs();
    expect(listOfAllBlogsAfter.length).toEqual(listOfAllBlogs.length - 1);
    const blogArray = listOfAllBlogsAfter.map((b) => b.id);
    expect(blogArray).not.toContain(blogToDelete);
  });

  test("Check if UPDATE works correctly", async () => {
    const listOfAllBlogs = await helper.getAllBlogs();
    const blogToUpdate = listOfAllBlogs[0];

    const newBlog = {
      ...blogToUpdate,
      likes: 10400,
    };

    const updatedBlog = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set("authorization", authToken)
      .send({ ...newBlog, ...{ new: true } })
      .expect(201);

    expect(updatedBlog.body.likes).toEqual(newBlog.likes);
  });
});

describe("Tests to correctly add blog posts to database", () => {
  test("Adding a blog post works correctly", async () => {
    const listOfAllBlogs = await helper.getAllBlogs();

    const blogToAdd = {
      title: "Squids Kids",
      author: "Squidward",
      url: "http://kitten-mittens.cat",
      likes: 1000000,
      user: listOfAllBlogs[0].id,
    };

    await api
      .post("/api/blogs")
      .set("authorization", authToken)
      .send(blogToAdd)
      .expect(201);

    const listOfAllBlogsAfter = await helper.getAllBlogs();

    const addedBlog = listOfAllBlogsAfter.find(
      (blog) => blog.title === blogToAdd.title
    );
    expect(addedBlog).toBeDefined();
    expect(listOfAllBlogsAfter).toHaveLength(listOfAllBlogs.length + 1);
  });

  test("Missing likes property defaults to 0", async () => {
    const listOfAllBlogs = await helper.getAllBlogs();

    const blogToAdd = {
      title: "Missing Likes Property",
      author: "Test Author",
      url: "http://test-url.com",
      user: listOfAllBlogs[0].id,
    };

    const response = await api
      .post("/api/blogs")
      .set("authorization", authToken)
      .send(blogToAdd)
      .expect(201);

    expect(response.body.likes).toBeDefined();
    expect(response.body.likes).toBe(0);
  });

  test("Missing title returns status 400", async () => {
    const blogToAdd = {
      author: "Test Author",
      url: "http://test-url.com",
      likes: 1000,
    };

    const response = await api.post("/api/blogs").send(blogToAdd);
    expect(response.status).toBe(400);
  });

  test("Missing author returns status 400", async () => {
    const blogToAdd = {
      title: "Honey, the author is missing!",
      url: "http://test-url.com",
      likes: 1000,
    };

    const response = await api.post("/api/blogs").send(blogToAdd);
    expect(response.status).toBe(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
