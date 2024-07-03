import { Request, Response } from "express";
import { Post } from "../db/models/Post";

export const createPost = (req: Request, res: Response) => {
  const {
    
  } = req.body;

  try {
    const newPost = Post.create({});
  } catch (error) {
    console.log(error);
  }
};
