import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createPost, getPostsByUserId } from "../controllers/posts-controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/getAllPosts", (req, res) => {
  return res.json({ message: "posts page" });
});

router.post("/create-post", verifyJWT, createPost);

router.get("/getPostsByUserId/:id", verifyJWT, getPostsByUserId);

export default router;
