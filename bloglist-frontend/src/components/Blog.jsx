import { useState } from "react";

const Blog = ({ blog, likeBlog, handleDeleteBlog, isDeleteAllowed }) => {
  const [show, setShow] = useState(false);

  const toggleShow = () => setShow(!show);

  const handleLikeBlog = () => {
    const { id, user, likes, ...blogWithoutFields } = blog;
    likeBlog(id, {
      ...blogWithoutFields,
      user: user.id,
      likes: likes + 1,
    });
  };

  return (
    <div
      id={"blog"}
      style={{
        borderStyle: "solid",
        borderWidth: "1px",
        borderRadius: "5px",
        marginBottom: "10px",
        padding: "10px",
      }}
    >
      {`${blog.title} - ${blog.author}`}{" "}
      <button onClick={toggleShow}>{show ? "Hide" : "View"}</button>
      {show && (
        <>
          <div>
            <a href={blog.url}>{blog.url}</a>
          </div>
          <div>
            likes {blog.likes}
            <button onClick={handleLikeBlog}>Like</button> <br />
          </div>
          <div>{blog.author}</div>
          {isDeleteAllowed && (
            <button onClick={() => handleDeleteBlog(blog)}>Delete</button>
          )}
        </>
      )}
    </div>
  );
};

export default Blog;
