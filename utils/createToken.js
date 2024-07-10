import jwt from "jsonwebtoken";
export const createToken = (payload) =>
  jwt.sign({ userId: payload }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
