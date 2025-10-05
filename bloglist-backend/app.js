require("dotenv").config(); // load .env
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const blogRouter = require("./controllers/blog");
const userRouter = require("./controllers/user");
const loginRouter = require("./controllers/login");
const {
  unknownEndpoint,
  errorHandler,
  requestLogger,
} = require("./utils/middleware");
const { MONGODB_URI } = require("./utils/config");
const { info } = require("./utils/logger");

const app = express();

mongoose.set("strictQuery", false);

mongoose
  .connect(
    process.env.NODE_ENV === "test" ? process.env.TEST_MONGODB_URI : MONGODB_URI
  )
  .then(() => info("MongoDB connection established"))
  .catch((error) => {
    info("error connecting to MongoDB:", error.message);
  });

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use("/api/blogs", blogRouter);
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
  const testingRouter = require("./controllers/testing");
  app.use("/api/testing", testingRouter);
}

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
