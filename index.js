// Core Modules
import path from "path";
// Third Party
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
// DB connection
import connectDB from "./DB/connection.js";

// Routers
import mountRoutes from "./src/mount.routes.js";

// Error Handling
import AppError from "./utils/appError.js";
import globalError from "./middlewares/errorMiddleware.js";

// Run Environment Variables
dotenv.config();

// express app
const app = express();

// Enables other domains to access your app
app.use(cors());
app.options("*", cors());
// Compression response
app.use(compression());
// middlewares
app.use(express.json());
app.use(express.static(path.join("uploads")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// DB connection
connectDB();

// Mount routes
mountRoutes(app);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.all("*", (req, res, next) => {
  // Create error and send it to error handler middleware
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 400));
});

// Global error handler middleware for express
app.use(globalError);

// Routes
const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
  console.log(`Example app listening on port💥 ${port}!📟`)
);

// Handel rejections outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down server...`);
    process.exit(1);
  });
});
