import { render, screen } from "@testing-library/react";
import BlogForm from "./BlogForm";
import userEvent from "@testing-library/user-event";

test("<BlogForm /> updates parent state and calls onSubmit", async () => {
  const handleAddBlog = vi.fn();
  const user = userEvent.setup();

  render(<BlogForm handleAddBlog={handleAddBlog} />);

  const title = screen.getByPlaceholderText("title");
  const author = screen.getByPlaceholderText("author");
  const url = screen.getByPlaceholderText("url");
  const sendButton = screen.getByText("save");

  await user.type(title, "testing a form...");
  await user.type(author, "testing a form...");
  await user.type(url, "testing a form...");
  await user.click(sendButton);

  expect(handleAddBlog.mock.calls).toHaveLength(1);
  expect(handleAddBlog.mock.calls[0][0].title).toBe("testing a form...");
  expect(handleAddBlog.mock.calls[0][0].author).toBe("testing a form...");
  expect(handleAddBlog.mock.calls[0][0].url).toBe("testing a form...");
});
