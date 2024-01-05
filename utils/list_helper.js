const { forEach, groupBy, maxBy, sumBy, map } = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  let likeCounter = 0;
  forEach(blogs, (blog) => (likeCounter += blog.likes));
  return likeCounter;
};

const favoriteBlog = (blogs) => {
  let mostLikes = blogs[0];
  forEach(blogs, (blog) => {
    if (blog.likes > mostLikes.likes) {
      mostLikes = blog;
    }
  });

  const { title, author, likes } = mostLikes;
  return { title, author, likes };
};

const mostBlogs = (blogList) => {
  const groupByAuthor = groupBy(blogList, (blog) => blog.author);
  const author = maxBy(
    Object.keys(groupByAuthor),
    (author) => groupByAuthor[author].length
  );
  const blogs = groupByAuthor[author].length;
  return { author, blogs };
};

const mostLikes = (blogList) => {
  const groupByAuthor = groupBy(blogList, (blog) => blog.author);
  const likesByAuthor = map(groupByAuthor, (array, author) => {
    let likes = sumBy(array, "likes");
    return { author, likes };
  });

  return maxBy(likesByAuthor, "likes");
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
