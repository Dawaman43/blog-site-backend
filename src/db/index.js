import mongoose from "mongoose";

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.mongo_url);
    console.log("mongo connected");
  } catch (error) {
    console.log("Mongo connection failed");
    process.exit(1);
  }
};

export default connectToDB;
