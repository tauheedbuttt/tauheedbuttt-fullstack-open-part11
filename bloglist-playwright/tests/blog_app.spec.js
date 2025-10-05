const { test, describe, expect, beforeEach } = require("@playwright/test");
const { loginWith, createBlogWith, logout } = require("./helper");

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset");
    await request.post("/api/users", {
      data: {
        username: "root",
        password: "Test@1234",
      },
    });
    await request.post("/api/users", {
      data: {
        username: "root2",
        password: "Test@1234",
      },
    });

    await page.goto("/");
  });

  test("Login form is shown", async ({ page }) => {
    await page.getByRole("button", { name: "Login" }).click();

    const username = page.getByLabel("username");
    const password = page.getByLabel("password");
    const login = page.getByRole("heading", { name: "Login" });

    await expect(username).toBeVisible();
    await expect(password).toBeVisible();
    await expect(login).toBeVisible();
  });

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await loginWith(page, "root", "Test@1234");

      // since the user does not have a name, only logged in shows
      await expect(page.getByText("logged in")).toBeVisible();
    });

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, "root", "Testt@1234");

      // in the exact div
      const errorDiv = page.locator(".error");
      await expect(errorDiv).toContainText("wrong credentials");
      await expect(errorDiv).toHaveCSS("border-style", "solid");
      await expect(errorDiv).toHaveCSS("color", "rgb(255, 0, 0)");

      // login does not show
      await expect(page.getByText("logged in")).not.toBeVisible();
    });
  });

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, "root", "Test@1234");
    });

    test("a new blog can be created", async ({ page }) => {
      await createBlogWith(page, {
        title: "Harry Potter",
        author: "JK. Rowlings",
        url: "http://localhost:5317",
      });
      await expect(page.getByText("Harry Potter")).toBeVisible();
    });

    describe("a single blog exists", () => {
      const baseBlog = {
        title: "Likeable Blog",
        author: "JK. Rowlings",
        url: "http://localhost:5317",
      };
      beforeEach(async ({ page }) => {
        await createBlogWith(page, baseBlog);
      });

      test("a blog can be liked", async ({ page }) => {
        // open the blog
        const blog = page.getByText(baseBlog.title).locator(".."); // go to parent if needed
        await blog.getByRole("button", { name: "View" }).click();

        // like the blog
        await page.getByRole("button", { name: "like" }).click();
        await expect(page.getByText("likes 1")).toBeVisible();
      });

      test("a blog can be deleted", async ({ page }) => {
        // open the blog
        const blog = page.getByText(baseBlog.title).locator(".."); // go to parent if needed
        await blog.getByRole("button", { name: "View" }).click();

        page.once("dialog", async (dialog) => {
          expect(dialog.type()).toBe("confirm"); // check it's a confirm dialog

          expect(dialog.message()).toContain(`Remove blog ${baseBlog.title}`);
          await dialog.accept();
        });

        // delete the blog
        await page.getByRole("button", { name: "Delete" }).click();

        // check that blog is gone after deletion
        await expect(page.getByText(baseBlog.title)).not.toBeVisible();
      });
    });

    describe("multiple blogs exists", () => {
      const baseBlogs = Array(3)
        .fill(0)
        .map((_, index) => ({
          title: `Blog - ${index + 1}`,
          author: "JK. Rowlings",
          url: "http://localhost:5317",
        }));

      beforeEach(async ({ page }) => {
        // create blogs with user 1
        for (const blog of baseBlogs) {
          await createBlogWith(page, blog);
        }

        await logout(page);

        // create blogs with user 2
        await loginWith(page, "root2", "Test@1234");
        for (const blog of baseBlogs) {
          blog.title = `${blog.title} - user 2`;
          await createBlogWith(page, blog);
        }
      });

      test("blogs created by logged in user are only delete-able", async ({
        page,
      }) => {
        const blogWithLoggedInUser = baseBlogs[0].title;
        const blogWithOtherUser = baseBlogs[0].title.replace(" - user 2", "");

        // open the blog created by logged in user
        const blog = page.locator("#blog", {
          hasText: `${blogWithLoggedInUser} - ${baseBlogs[0].author}`,
        });
        await blog.getByRole("button", { name: "View" }).click();

        await expect(
          blog.getByRole("button", { name: "Delete" })
        ).toBeVisible();

        // open the blog not created by user
        const blog2 = page.locator("#blog", {
          hasText: `${blogWithOtherUser} - ${baseBlogs[0].author}`,
        });
        await blog2.getByRole("button", { name: "View" }).click();

        await expect(
          blog2.getByRole("button", { name: "Delete" })
        ).not.toBeVisible();
      });

      test("blogs are sorted in descending order of likes", async ({
        page,
      }) => {
        let likes = 1; // starts with 1, increments by 1 on every loop
        for (const blog of baseBlogs) {
          // find the last 3 created blogs
          const blogDiv = page.locator("#blog", {
            hasText: `${blog.title} - ${blog.author}`,
          });
          await blogDiv.getByRole("button", { name: "View" }).click();

          //   like the selected block "likes" amount of times
          const likeButton = blogDiv.getByRole("button", { name: "like" });
          for (let i = 0; i < likes; i++) {
            await likeButton.click();
            await blogDiv.getByText(`likes ${i + 1}`).waitFor();
          }

          ++likes;
        }

        // get the sorted blogs from the screen after liking them all
        const blogsSorted = page.locator("#blog").filter({
          hasText: "user 2",
        });

        // extract the top 3 liked counts
        const count = await blogsSorted.count();
        const likesArray = [];
        for (let i = 0; i < count; i++) {
          // find the like counter of each item
          const blog = blogsSorted.nth(i);
          const likeCounter = await blog
            .getByText("likes", { exact: false })
            .textContent();

          // extract likes count from the text likes NLike
          const match = likeCounter.match(/\d+/);
          const likes = match ? parseInt(match[0], 10) : null;
          likesArray.push(likes);
        }

        // the resultant array should be 3,2,1
        expect(JSON.stringify(likesArray)).toBe(JSON.stringify([3, 2, 1]));
      });
    });
  });
});
