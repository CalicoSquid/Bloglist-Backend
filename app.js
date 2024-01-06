const express = require("express");
const cors = require("cors");
require("express-async-errors");
const app = express();

const blogRouter = require("./controllers/blogs");
const userRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");

const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => logger.info("Conected to MongoDB"))
  .catch((error) => logger.info("Error connecting to MongoDB", error.message));

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.verifyToken);

app.use('/api/blogs', middleware.userExtractor, blogRouter)
app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
