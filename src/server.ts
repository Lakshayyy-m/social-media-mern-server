import dotEnv from "dotenv";
dotEnv.config();
import express, { Request, Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import postRouter from "./routes/posts";
import userRouter from "./routes/users";

const app = express();

//Database connection
mongoose.connect(process.env.MONGO_URL!).then(() => {
  console.log("Mongo Connected");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/posts", postRouter);

app.use("/api/user", userRouter);

app.use((error: any, req: any, res: any, next: any) => {
  if (req.headerSent) {
    next(error);
  }
});

app.listen(5000, () => {
  console.log("Server is running");
});
