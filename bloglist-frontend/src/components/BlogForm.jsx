import { useState } from "react";
const baseBlogState = {
  title: "",
  url: "",
  author: "",
};

const BlogForm = ({ handleAddBlog }) => {
  const [blog, setBlog] = useState(baseBlogState);

  const handleChange = (e) => {
    setBlog({
      ...blog,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    handleAddBlog(blog);
  };
  return (
    <div>
      <h2>Create a new blog</h2>

      <form onSubmit={onSubmit}>
        <label>
          Title:
          <input
            placeholder="title"
            name="title"
            value={blog.title}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Author:
          <input
            placeholder="author"
            name="author"
            value={blog.author}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          URL:
          <input
            placeholder="url"
            name="url"
            value={blog.url}
            onChange={handleChange}
          />
        </label>
        <br />
        <button type="submit">save</button>
      </form>
    </div>
  );
};

export default BlogForm;
