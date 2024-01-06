const logger = require("./logger");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const decodeAndVerifyToken = (token) => {
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!decodedToken.id) {
    return res.status(401).json({ error: "token invalid" });
  }
  return decodedToken;
};

const requestLogger = (req, res, next) => {
  logger.info("Method:", req.method);
  logger.info("Path:  ", req.path);
  logger.info("Body:  ", req.body);
  logger.info("---");
  next();
};

const verifyToken = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization) {
    const token = authorization.substring(7);
    const decodedToken = decodeAndVerifyToken(token);
    req.decodedToken = decodedToken
  }
  next();
};

const userExtractor = async (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization) {
    const token = authorization.substring(7);
    const decodedToken = decodeAndVerifyToken(token);
    const user = await User.findById(decodedToken.id);
    req.user = user;
  }
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown Endpoint" });
};

const errorHandler = (error, req, res, next) => {
  logger.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  } else if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ error: error.message });
  } else if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "token expired",
    });
  }
  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  verifyToken,
  userExtractor,
};
