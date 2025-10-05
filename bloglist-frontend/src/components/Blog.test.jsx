import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Blog from "./Blog";

describe("Blog.tsx", () => {
  const blog = {
    _id: "5a43fde2cbd20b12a2c34e91",
    user: {
      _id: "5a43e6b6c37f3d065eaaa581",
      username: "mluukkai",
      name: "Matti Luukkainen",
    },
    likes: 0,
    author: "Joel Spolsky",
    title: "The Joel Test: 12 Steps to Better Code",
    url: "https://www.joelonsoftware.com/2000/08/09/the-joel-test-12-steps-to-better-code/",
  };

  test("renders title - author by default, no url and likes", async () => {
    render(<Blog blog={blog} />);

    const titleAndAuthor = screen.getByText(`${blog.title} - ${blog.author}`);
    const url = screen.queryByText(`${blog.url}`);
    const likes = screen.queryByText(`likes ${blog.likes}`);

    expect(titleAndAuthor).toBeVisible();
    expect(url).toBeNull();
    expect(likes).toBeNull();
  });

  test("renders url and likes after clicking on view", async () => {
    const mockHandler = vi.fn();

    render(<Blog blog={blog} likeBlog={mockHandler} />);

    const user = userEvent.setup();
    const button = screen.getByText("View");
    await user.click(button);

    const url = screen.queryByText(`${blog.url}`);
    const likes = screen.queryByText(`likes ${blog.likes}`);

    expect(url).toBeVisible();
    expect(likes).toBeVisible();
  });

  test("like button is clicked twice", async () => {
    const mockHandler = vi.fn();

    render(<Blog blog={blog} likeBlog={mockHandler} />);

    const user = userEvent.setup();
    const button = screen.getByText("View");
    await user.click(button);

    const likeButton = screen.getByText("Like");
    await user.click(likeButton);
    await user.click(likeButton);

    expect(mockHandler.mock.calls).toHaveLength(2);
  });
});
