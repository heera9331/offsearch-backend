import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongo = process.env.MONGO_URL;

    const conn = await mongoose
      .connect(mongo)
      .then(() => console.log("Database connected!"))
      .catch((err) => console.error("Connection error:", err));
  } catch (error) {
    console.log(error);
    console.log("database error");
  }
};

export { connectDB };
