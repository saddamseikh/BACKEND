import dotenv from "dotenv";
import connectToDB from "./db/DbConnection.js";

dotenv.config({
  path: "./env",
});

connectToDB();
