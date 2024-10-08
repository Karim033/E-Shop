// Core Modules
import path from "path";
// Third Party
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import ExpressMongoSanitize from "express-mongo-sanitize";
import { xss } from "express-xss-sanitizer";
import helmet from "helmet";
// DB connection
import connectDB from "./DB/connection.js";

// Routers
import mountRoutes from "./src/mount.routes.js";
// checkout webhook
import { webhookCheckout } from "./src/modules/order/order.conroller.js";
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
// checkout webhook
app.post(
  "/api/v1/webhook-checkout",
  express.raw({ type: "application/json" }),
  webhookCheckout
);
// middlewares
app.use(express.json({ limit: "2kb" }));
app.use(express.static(path.join("uploads")));
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// To Avoid NoSQL query injection
app.use(ExpressMongoSanitize());
// To Avoid XSS attacks
app.use(xss());
// Apply the rate limiting middleware to all requests.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api", limiter);

// Express middleware to protect against HTTP Parameter Pollution attacks
app.use(
  hpp({
    whitelist: [
      "price",
      "sold",
      "quantity",
      "ratingsAverage",
      "ratingsQuantity",
    ],
  })
);

// set security HTTP headers
app.use(helmet());

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
