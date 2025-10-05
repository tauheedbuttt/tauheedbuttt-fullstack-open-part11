const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const logger = require("./logger");
const User = require("../models/user");

morgan.token("body", function (req) {
  return JSON.stringify(req.body);
});

const ignoreMiddleware = (_, _2, next) => next();
const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms :body"
);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({ error: "token expired" });
  }

  next(error);
};

const tokenExtractor = async (req, res, next) => {
  const authorization = req.get("authorization");
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "token is missing" });

  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) return res.status(401).json({ error: "token invalid" });

  req.decodedToken = decodedToken;
  next();
};

const userExtractor = async (req, res, next) => {
  const user = await User.findById(req.decodedToken.id);
  if (!user) return res.status(401).json({ error: "token invalid" });

  req.user = user;
  next();
};

module.exports = {
  requestLogger:
    process.env.NODE_ENV === "test" ? ignoreMiddleware : requestLogger,
  errorHandler,
  unknownEndpoint,
  tokenExtractor,
  userExtractor,
};
