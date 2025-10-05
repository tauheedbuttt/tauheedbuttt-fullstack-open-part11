const { test, after, describe, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const assert = require("node:assert");
const {
  validBlog,
  usersInDb,
  validToken,
  createRootUser,
} = require("./tests_helper");

const api = supertest(app);

describe("User APIs", () => {
  beforeEach(async () => {
    await createRootUser();
  });

  describe("getting a user", () => {
    test("all users are returned", async () => {
      const usersInStart = await usersInDb();
      const response = await api.get("/api/users/");

      assert.strictEqual(response.body.length, usersInStart.length);
    });

    test("users who have created blogs, should have title of those blogs", async () => {
      const { token, username } = await validToken(api);

      // Create a blog
      const newBlog = validBlog;
      const newBlogResponse = await api
        .post("/api/blogs/")
        .set({ authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      // fetch blogs with the api
      const response = await api.get("/api/users/");

      const usersWithBlogs = response.body.find(
        (item) => item.username === username
      ).blogs;

      const blog = usersWithBlogs.find(
        (item) => item.id === newBlogResponse.body.id
      );

      assert(!!blog);
    });
  });

  describe("creating a user", () => {
    test("creation succeeds with a fresh username", async () => {
      const usersAtStart = await usersInDb();

      const newUser = {
        username: "tauheedbutt",
        name: "Tauheed Butt",
        password: "Test@1234",
      };

      await api
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await usersInDb();
      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

      const usernames = usersAtEnd.map((u) => u.username);
      assert(usernames.includes(newUser.username));
    });

    test("creation fails with proper statuscode and message if username already taken", async () => {
      const usersAtStart = await usersInDb();

      const newUser = {
        username: "root",
        name: "Tauheed Butt",
        password: "Test@1234",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await usersInDb();
      assert(result.body.error.includes("expected `username` to be unique"));

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if username is missing", async () => {
      const usersAtStart = await usersInDb();

      const newUser = {
        name: "Tauheed Butt",
        password: "Test@1234",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await usersInDb();
      assert(result.body.error.includes("Username is required"));

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if password is missing", async () => {
      const usersAtStart = await usersInDb();

      const newUser = {
        username: "root",
        name: "Tauheed Butt",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await usersInDb();
      assert(result.body.error.includes("Password is required"));

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if username is less than 3 characters", async () => {
      const usersAtStart = await usersInDb();

      const newUser = {
        username: "r",
        name: "Tauheed Butt",
        password: "Test@1234",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await usersInDb();
      assert(
        result.body.error.includes(
          "Username must be at least 3 characters long"
        )
      );

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test("creation fails with proper statuscode and message if password is less than 3 characters", async () => {
      const usersAtStart = await usersInDb();

      const newUser = {
        username: "tauheed",
        name: "Tauheed Butt",
        password: "T",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await usersInDb();
      assert(
        result.body.error.includes(
          "Password must be at least 3 characters long"
        )
      );

      assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
