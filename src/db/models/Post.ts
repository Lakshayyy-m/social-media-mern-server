import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
    imgUrl: [String],
    comments: [
      {
        commentId: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        likesCount: Number,
        body: String,
      },
    ],
    description: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);

export const Post =
  mongoose.models?.post || mongoose.model("post", PostSchema, "posts");
