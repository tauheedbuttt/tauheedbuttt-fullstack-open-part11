const logout = async (page) => {
  // open the form
  await page.getByRole("button", { name: "Log out" }).click();
  await page.getByRole("button", { name: "login" }).waitFor();
};

const loginWith = async (page, username, password) => {
  // open the form
  await page.getByRole("button", { name: "login" }).click();

  // enter details
  await page.getByLabel("username").fill(username);
  await page.getByLabel("password").fill(password);

  // try to login
  await page.getByRole("button", { name: "login" }).click();
};

const createBlogWith = async (page, blog) => {
  await page.getByRole("button", { name: "Create new blog" }).click();
  await page.getByPlaceholder("title").fill(blog.title);
  await page.getByPlaceholder("author").fill(blog.author);
  await page.getByPlaceholder("url").fill(blog.url);
  await page.getByRole("button", { name: "save" }).click();

  await page.getByText(`${blog.title} - ${blog.author}`).waitFor();
};

export { loginWith, createBlogWith, logout };
