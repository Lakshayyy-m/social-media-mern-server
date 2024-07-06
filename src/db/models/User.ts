import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    profileImg: { type: String },
    bio: { type: String },
    refreshToken: { type: String },
  },
  { timestamps: true }
);




UserSchema.methods.isPasswordCorrect = async function (password: string) {
  const result = await bcrypt.compare(password, this.password);
  return result;
};

UserSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      username: this.username,
      password: this.password,
    },
    process.env.TOKEN_SECRET!,
    {
      expiresIn: "2d",
    }
  );
};

UserSchema.methods.generateRefreshToken = async function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.TOKEN_SECRET!,
    {
      expiresIn: "20d",
    }
  );
};

export const User =
  mongoose.models?.users || mongoose.model("user", UserSchema);

//!creating users so that to map them to the posts and then further render posts on the frontend
