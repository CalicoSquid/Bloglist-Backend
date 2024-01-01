const logger = require("./logger");

const requestLogger = (req, res, next) => {
  logger.info("Method:", req.method);
  logger.info("Path:  ", req.path);
  logger.info("Body:  ", req.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "Unknown Endpoint" });
};

const errorHandler = (error, req, res, next) => {
  const { message, name } = error;
  logger.error(message);
  return name === "CastError"
    ? res.status(400).send({ error: "malformatted id" })
    : name === "ValidationError"
    ? res.status(400).send({ error: message })
    : next(error);
};

module.exports = { requestLogger, unknownEndpoint, errorHandler };
