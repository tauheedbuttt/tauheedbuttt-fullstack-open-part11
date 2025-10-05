const { test, after, describe, beforeEach, before } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert");
const Blog = require("../models/blog");
const {
  blogs,
  blogsInDb,
  invalidBlogWithoutTitle,
  invalidBlogWithoutUrl,
  validBlog,
  validBlogWithoutLikes,
  idNotFoundTest,
  invalidIdTest,
  validToken,
  createRootUser,
} = require("./tests_helper");

const api = supertest(app);

before(async () => {});

describe("Blog APIs", () => {
  beforeEach(async () => {
    await Blog.deleteMany({});
    await Blog.insertMany(blogs);
    await createRootUser();
  });

  describe("getting blogs data", () => {
    test("blogs who have user assigned, should have username and name fields", async () => {
      const { token, username } = await validToken(api);

      // create a blog
      const newBlog = validBlog;
      const createdBlogResponse = await api
        .post("/api/blogs/")
        .set({ authorization: `Bearer ${token}` })
        .send({ ...newBlog, title: "Blog With User" })
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const response = await api.get("/api/blogs/");

      const blogsWithUsers = response.body.find(
        (item) => item.id === createdBlogResponse.body.id
      );

      assert.strictEqual(blogsWithUsers.user.username, username);
    });

    // Ex: 4.8
    test("all blogs are returned", async () => {
      const response = await api.get("/api/blogs/");

      assert.strictEqual(response.body.length, blogs.length);
    });

    // Ex: 4.9
    test("all blogs have unique identifier as 'id'", async () => {
      const response = await api.get("/api/blogs/");

      assert(response.body.every((blog) => !!blog.id && !blog._id));
    });

    test(
      "fails with statuscode 404 during get if note does not exist",
      idNotFoundTest(api, "get", "/api/blogs/")
    );
    test(
      "fails with statuscode 400 during get id is invalid",
      invalidIdTest(api, "get", "/api/blogs/")
    );
  });

  describe("creating new blog", () => {
    // Ex: 4.10
    test("a valid blog can be added ", async () => {
      const { token } = await validToken(api);

      const newBlog = validBlog;
      await api
        .post("/api/blogs/")
        .send(newBlog)
        .set({ authorization: `Bearer ${token}` })
        .expect(201)
        .expect("Content-Type", /application\/json/);

      //increased by 1
      const blogsAtEnd = await blogsInDb();
      assert.strictEqual(blogsAtEnd.length, blogs.length + 1);

      // validate data by finding the title of the entered blog
      const titles = blogsAtEnd.map((r) => r.title);
      assert(titles.includes(newBlog.title));
    });

    // Ex: 4.11
    test("likes is set to 0 if not provided", async () => {
      const { token } = await validToken(api);
      const newBlog = validBlogWithoutLikes;
      await api
        .post("/api/blogs/")
        .send(newBlog)
        .set({ authorization: `Bearer ${token}` })
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await blogsInDb();
      const blogCreated = blogsAtEnd.find(
        (blog) => blog.title === newBlog.title
      );

      assert.equal(blogCreated.likes, 0);
    });

    // Ex: 4.11
    test("'title' and 'url' fields are required fields", async () => {
      const { token } = await validToken(api);
      const newBlog = validBlogWithoutLikes;
      await api
        .post("/api/blogs/")
        .send(newBlog)
        .expect(201)
        .set({ authorization: `Bearer ${token}` })
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await blogsInDb();
      const blogCreated = blogsAtEnd.find(
        (blog) => blog.title === newBlog.title
      );

      assert.equal(blogCreated.likes, 0);
    });

    // Ex: 4.12
    test("blog without title is not added", async () => {
      const { token } = await validToken(api);
      const newBlog = invalidBlogWithoutTitle;

      await api
        .post("/api/blogs/")
        .send(newBlog)
        .set({ authorization: `Bearer ${token}` })
        .expect(400);

      const blogsAtEnd = await blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogs.length);
    });

    test("blog without url is not added", async () => {
      const { token } = await validToken(api);
      const newBlog = invalidBlogWithoutUrl;

      await api
        .post("/api/blogs/")
        .send(newBlog)
        .set({ authorization: `Bearer ${token}` })
        .expect(400);

      const blogsAtEnd = await blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogs.length);
    });

    // Ex: 4.23
    test("blog without valid token is not added", async () => {
      const token = "asdad";
      const newBlog = invalidBlogWithoutUrl;

      await api
        .post("/api/blogs/")
        .send(newBlog)
        .set({ authorization: `Bearer ${token}` })
        .expect(401);

      const blogsAtEnd = await blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogs.length);
    });
  });

  describe("deleting a blog", () => {
    // Ex: 4.13
    test("a blog can be deleted with valid id", async () => {
      const { token } = await validToken(api);

      // create a blog that is about to be deleted
      const newBlog = validBlog;
      const createBlogResponse = await api
        .post("/api/blogs/")
        .send(newBlog)
        .set({ authorization: `Bearer ${token}` })
        .expect(201)
        .expect("Content-Type", /application\/json/);

      // delete blog for the user
      const blogToDelete = createBlogResponse.body;

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set({ authorization: `Bearer ${token}` })
        .expect(204);

      const blogsAtEnd = await blogsInDb();

      const blogs = blogsAtEnd.map((n) => n.id);
      assert(!blogs.includes(blogToDelete.id));

      assert.strictEqual(blogsAtEnd.length, blogs.length);
    });

    test("fails with statuscode 400 during delete id is invalid", async () => {
      const { token } = await validToken(api);
      invalidIdTest(api, "delete", "/api/blogs/", {
        authorization: `Bearer ${token}`,
      });
    });
  });

  describe("updating a blog", () => {
    // Ex: 4.14
    test("a blog can be updated", async () => {
      const blogsAtStart = await blogsInDb();
      const blogToUpdate = blogsAtStart[0];
      blogToUpdate.likes = 50;

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(blogToUpdate)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await blogsInDb();

      const updatedBlog = blogsAtEnd.find((n) => n.id === blogToUpdate.id);
      assert.deepStrictEqual(updatedBlog, blogToUpdate);
    });

    test("a blog can not be updated if body is not provided", async () => {
      const blogsAtStart = await blogsInDb();
      const blogToUpdate = blogsAtStart[0];
      blogToUpdate.likes = 50;

      await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .expect(400)
        .expect("Content-Type", /application\/json/);
    });

    test("fails with statuscode 404 during update if blog does not exist", async () => {
      const blogsAtStart = await blogsInDb();
      const blogToUpdate = blogsAtStart[0];
      idNotFoundTest(api, "put", "/api/blogs/", blogToUpdate);
    });
    test("fails with statuscode 400 during update id is invalid", async () => {
      const blogsAtStart = await blogsInDb();
      const blogToUpdate = blogsAtStart[0];
      invalidIdTest(api, "put", "/api/blogs/", blogToUpdate);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
