const blogRouter = require("express").Router();
const {
  Types: { ObjectId },
} = require("mongoose");
const Blog = require("../models/blog");
const { tokenExtractor, userExtractor } = require("../utils/middleware");

blogRouter.get("/:id", async (request, response) => {
  const { id } = request.params;
  const blog = await Blog.findById(id).populate("user", {
    username: 1,
    name: 1,
  });
  if (blog) return response.json(blog);
  else return response.status(404).json({ error: "Blog not found." });
});

blogRouter.delete(
  "/:id",
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const { id } = request.params;
    const { user } = request;

    const blog = await Blog.findOneAndDelete(
      { _id: new ObjectId(id), user: user._id },
      { new: true }
    );
    if (!blog)
      return response.status(404).json({ error: "Blog does not exist" });

    user.blogs = user.blogs.filter((item) => item !== id);
    await user.save();

    return response.status(204).send();
  }
);

blogRouter.put("/:id", async (request, response) => {
  const { id } = request.params;

  if (!request.body)
    return response.status(400).json({ error: "Blog data is required" });

  const { title, author, url, likes } = request.body;

  const blog = await Blog.findByIdAndUpdate(
    id,
    { title, author, url, likes },
    { new: true }
  ).populate("user", "id username name");

  if (!blog) return response.status(404).send();

  return response.status(200).json(blog);
});

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  return response.json(blogs);
});

blogRouter.post(
  "/",
  tokenExtractor,
  userExtractor,
  async (request, response) => {
    const { user } = request;

    // save id in blog
    const blog = new Blog({ ...request.body, user: user.id });
    const result = await (
      await blog.save()
    ).populate("user", "id name username");

    // save blog in user
    user.blogs = [...user.blogs, blog.id];
    await user.save();

    response.status(201).json(result);
  }
);

module.exports = blogRouter;
