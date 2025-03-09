import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.route.js";
import messageRouter from "./routes/message.route.js";
import { dbconnect } from "./lib/db.js";

import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
  dbconnect();
});
