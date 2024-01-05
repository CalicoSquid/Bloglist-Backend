const listHelper = require("../utils/list_helper");
const helper = require("./test-helper")
// Define the blogs array
const blogs = helper.blogs;
// Tests

test("dummy returns one", () => {
  const result = listHelper.dummy(blogs);
  expect(result).toBe(1);
});

describe("Total Likes", () => {
  test("Count total likes on list of 1 blog", () => {
    const listWithOneBlog = [blogs[0]];
    const total = listHelper.totalLikes(listWithOneBlog);
    expect(total).toBe(7);
  });

  test("Count total likes on list of many blogs", () => {
    const total = listHelper.totalLikes(blogs);
    expect(total).toBe(36);
  });
});

describe("Blog Stats", () => {
  test("Find the favorite blog", () => {
    const favorite = listHelper.favoriteBlog(blogs);
    expect(favorite).toEqual({
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    });
  });

  test("Find Which author wrote the most blogs", () => {
    const mostBlogs = listHelper.mostBlogs(blogs);
    expect(mostBlogs).toEqual({
      author: "Robert C. Martin",
      blogs: 3,
    });
  });

  test("Find which author had the most likes", () => {
    const mostLikes = listHelper.mostLikes(blogs);
    expect(mostLikes).toEqual({
      author: "Edsger W. Dijkstra",
      likes: 17,
    });
  });
});
