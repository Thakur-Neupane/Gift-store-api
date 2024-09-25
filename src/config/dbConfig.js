import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);

    conn && console.log("Data Base is Connected");
  } catch (error) {
    console.log(error);
  }
};
