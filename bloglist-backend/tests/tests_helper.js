const bcrypt = require("bcrypt");
const Blog = require("../models/blog");
const User = require("../models/user");

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const blogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

const validBlog = {
  title: "Next patterns",
  author: "Michael Chan",
  url: "https://reactpatterns.com/",
  likes: 27,
};

const invalidBlogWithoutTitle = {
  author: "Michael Chan",
  url: "https://reactpatterns.com/",
};

const invalidBlogWithoutUrl = {
  title: "Blog without ID",
  author: "Tauheed Butt",
};

const validBlogWithoutLikes = {
  title: "Blog without ID",
  author: "Tauheed Butt",
  url: "https://reactpatterns.com/",
};

const validUser = {
  username: "root",
  password: "Test@1234",
};

const methods = (api) => ({
  delete: api.delete,
  get: api.get,
  put: api.put,
});

const nonExistingId = async () => {
  const blog = new Blog(validBlog);
  await blog.save();
  await blog.deleteOne();

  return blog._id.toString();
};

const idNotFoundTest =
  (api, method, endpoint, data, headers = {}) =>
  async () => {
    const validNonexistingId = await nonExistingId();

    const selectedMethod = methods(api)[method];

    await selectedMethod(`${endpoint}${validNonexistingId}`)
      .set(headers)
      .send(data)
      .expect(404);
  };

const invalidIdTest =
  (api, method, endpoint, data, headers = {}) =>
  async () => {
    const invalidId = "bjh";

    const selectedMethod = methods(api)[method];

    await selectedMethod(`${endpoint}${invalidId}`)
      .set(headers)
      .send(data)
      .expect(400);
  };

const validToken = async (api) => {
  // Login to receive a token
  const response = await api
    .post("/api/login")
    .send(validUser)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  return response.body;
};

const createRootUser = async () => {
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash(validUser.password, 10);
  const user = new User({ username: validUser.username, passwordHash });

  await user.save();
};

module.exports = {
  validUser,
  blogs,
  validBlog,
  invalidBlogWithoutTitle,
  invalidBlogWithoutUrl,
  validBlogWithoutLikes,
  nonExistingId,
  blogsInDb,
  usersInDb,
  idNotFoundTest,
  invalidIdTest,
  validToken,
  createRootUser,
};
