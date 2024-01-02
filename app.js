const express = require("express");
const cors = require("cors");

const app = express();

const config = require("./utils/config");
const logger = require("./utils/logger");

const router = require("./controllers/blogs");
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
app.use("/api/blogs", router);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
