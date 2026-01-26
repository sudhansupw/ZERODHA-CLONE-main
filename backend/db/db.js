import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

const ConnectDB = async () => {
  try {
    mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected !!!");
  } catch (error) {
    console.log("MongoDB connection error !!!", error);
    process.exit(1);
  }
};

export default ConnectDB;
