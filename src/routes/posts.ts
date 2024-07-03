import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createPost } from "../controllers/posts-controller";

const router = express.Router();

router.get("/getAllPosts", (req, res) => {
  return res.json({ message: "posts page" });
});

router.get("/create-post", createPost);

export default router;
