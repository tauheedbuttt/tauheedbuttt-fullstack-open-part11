import { useState, useEffect, useRef } from "react";
import Blog from "./components/Blog";
import blogService from "./services/blogs";
import loginService from "./services/login";
import Notification from "./components/Notification";
import LoginForm from "./components/LoginForm";
import BlogForm from "./components/BlogForm";
import Togglable from "./components/Togglable";

const localStorageKey = "loggedNoteappUser";

const App = () => {
  const baseNotification = {
    message: null,
    variant: "error",
  };

  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [notification, setNotification] = useState(baseNotification);
  const noteFormRef = useRef();

  const showNotification = (data) => {
    setNotification({ ...notification, ...data });
    setTimeout(() => setNotification(baseNotification), 5000);
  };

  const handleError = (err) => {
    const message = err?.response?.data?.error;
    const code = err?.response?.status;
    showNotification({ message });
    console.log(err);
    if (code === 401) return handleLogout();
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await loginService.login({ username, password });
      setUser(user);
      blogService.setToken(user.token);
      localStorage.setItem(localStorageKey, JSON.stringify(user));
      setUsername("");
      setPassword("");
    } catch {
      showNotification({ message: "wrong credentials" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(localStorageKey);
    setUser(null);
  };

  const handleAddBlog = async (blog) => {
    try {
      const returnedBlog = await blogService.create(blog);
      setBlogs(blogs.concat(returnedBlog));
      noteFormRef.current?.toggleVisibility();
    } catch (err) {
      handleError(err);
    }
  };

  const handleLikeBlog = async (id, blog) => {
    try {
      const returnedBlog = await blogService.update(id, blog);
      setBlogs(blogs.map((item) => (item.id === id ? returnedBlog : item)));
    } catch (err) {
      handleError(err);
    }
  };

  const handleDeleteBlog = async (blog) => {
    const isConfirmed = confirm(`Remove blog ${blog.title}`);
    if (!isConfirmed) return;

    try {
      await blogService.deleteBlog(blog.id);
      setBlogs(blogs.filter((item) => item.id !== blog.id));
    } catch (err) {
      handleError(err);
    }
  };

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs));
  }, []);

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(localStorageKey);
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
    }
  }, []);

  return (
    <div>
      <h2>BLOGS</h2>
      <Notification
        message={notification.message}
        variant={notification.variant}
      />
      {!user && (
        <Togglable buttonLabel="Login">
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleSubmit={handleLogin}
          />
        </Togglable>
      )}
      {user && (
        <div>
          {" "}
          <p>
            {user.name} logged in{" "}
            <button onClick={handleLogout}>Log out </button>
          </p>{" "}
          <Togglable buttonLabel="Create new blog" ref={noteFormRef}>
            <BlogForm handleAddBlog={handleAddBlog} />
          </Togglable>
        </div>
      )}
      <br />
      {blogs
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            likeBlog={handleLikeBlog}
            handleDeleteBlog={handleDeleteBlog}
            isDeleteAllowed={blog.user?.username === user?.username}
          />
        ))}
    </div>
  );
};

export default App;
