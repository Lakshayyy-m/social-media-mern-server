import { Request, Response } from "express";
import { Post } from "../db/models/Post";

export const createPost = (req: Request, res: Response) => {
  const {} = req.body;

  try {
    const newPost = Post.create({});
  } catch (error) {
    console.log(error);
  }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const posts = await Post.find({ userId: req.params.id });
    if (!posts) {
      return res.status(200).json({ message: "No Posts", posts: [] });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error fetching posts" });
  }
};
