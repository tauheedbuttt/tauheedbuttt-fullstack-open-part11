const { groupBy } = require("lodash");

const dummy = (blogs) => {
  console.log(blogs);
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.map((item) => item.likes).reduce((a, b) => a + b, 0);
};

const favoriteBlog = (blogs) => {
  const maxLikes = Math.max(...blogs.map((item) => item.likes));
  const blog = blogs.find((item) => item.likes === maxLikes);
  return blog;
};

const mostBlogs = (blogs) => {
  const authors = groupBy(blogs, "author");

  const authorWithBlog = Object.keys(authors).map((key) => ({
    author: key,
    blogs: authors[key].length,
  }));

  const mostBlogs = Math.max(...authorWithBlog.map((item) => item.blogs));
  const authorWithMostBlogs = authorWithBlog.find(
    (item) => item.blogs === mostBlogs
  );

  return authorWithMostBlogs;
};

const mostLikes = (blogs) => {
  const authors = groupBy(blogs, "author");

  const authorWithLike = Object.keys(authors).map((key) => ({
    author: key,
    likes: authors[key].reduce((a, b) => a + b.likes, 0),
  }));

  const mostLikes = Math.max(...authorWithLike.map((item) => item.likes));
  const authorWithMostLikes = authorWithLike.find(
    (item) => item.likes === mostLikes
  );

  return authorWithMostLikes;
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
