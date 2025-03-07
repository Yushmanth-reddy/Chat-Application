import mongoose from "mongoose";

export const dbconnect = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    console.log("connect to mongoBD url:", conn.connection.host);
  } catch (err) {
    console.log(err);
  }
};
