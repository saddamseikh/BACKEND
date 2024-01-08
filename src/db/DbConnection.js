import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectToDB = async () => {
  try {
    const { connection } = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );

    // If mongodb connect then terminal showing  server port is connected
    if (connection) {
      console.log(`Connected to MongoDB: ${connection.host}`);
    }
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectToDB;
