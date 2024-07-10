import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.DB_URI).then((conn) => {
    console.log(`Database connected with ${conn.connection.host}✅`);
  });
};

export default connectDB;
