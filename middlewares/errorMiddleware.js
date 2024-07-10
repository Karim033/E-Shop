import AppError from "../utils/appError.js";

const sendErrorForDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const handelJwtInvalidSigniture = () =>
  new AppError("Invalid token. Please login again", 401);

const handelJwtExpired = () =>
  new AppError("Your token has expired. Please login again", 401);

const globalError = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name == "JsonWebTokenError") err = handelJwtInvalidSigniture();
    if (err.name == "TokenExpiredError") err = handelJwtExpired();
    sendErrorForProd(err, res);
  }
};

export default globalError;
