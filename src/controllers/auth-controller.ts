import dotenv from "dotenv";
dotenv.config();
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userSchema } from "../utils/validation";
import { User } from "../db/models/User";

export const loginUser = async (req: Request, res: Response) => {
  const data = req.body;

  //data validated
  const result = userSchema.safeParse(data);
  if (!result.success) {
    console.log(data);
    return res.status(403).json({ message: result.error.issues[0].message }); //!error 403 for invalid data
  }

  try {
    let user;
    if (data.username) {
      user = await User.findOne({ username: data.username });
    } else if (data.email) {
      user = await User.findOne({ email: data.email });
    }

    //checking user existence in database
    if (!user) {
      return res
        .status(302)
        .json({ message: "User does not exist, kindly sign up first" }); //!error 403 is sent to redirect user to redirect page
    }

    //verifying password
    if (!(await user.isPasswordCorrect(data.password))) {
      return res.status(401).json({ message: "Invalid user credentials" });
    }

    //generating tokens
    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const loggedInUser = user;
    delete loggedInUser.refreshToken;
    delete loggedInUser.password;

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        message: "User successfuly logged in",
        user: loggedInUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Some error occured" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Could not logout" });
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json({ message: "You are successfully logged out!" });
};

export const signUpUser = async (req: Request, res: Response) => {
  const data = req.body;

  //data validation
  const result = userSchema.safeParse(data);
  if (!result.success) {
    console.log(data);
    return res.status(403).json({ message: result.error.issues[0].message }); //!error 403 for invalid data
  }

  try {
    const user = await User.findOne({
      email: data.email,
      username: data.username,
    });
    //checking for user existence
    if (!user) {
      //implement signup
      const newUser = await User.create({
        name: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const accessToken = await newUser.generateAccessToken();
      const refreshToken = await newUser.generateRefreshToken();
      newUser.refreshToken = refreshToken;
      await newUser.save();

      const options = {
        httpOnly: true,
        secure: true,
      };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({ message: "User successfully created" });
      //!also implmement redirect of user
    } else {
      //implement login
      //verifying password
      if (!(await user.isPasswordCorrect(data.password))) {
        return res.status(401).json({
          message:
            "User already exists, but could not login due to invalid credentials",
        });
      }

      //generating tokens
      const accessToken = await user.generateAccessToken();

      const refreshToken = await user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      const loggedInUser = user;
      delete loggedInUser.refreshToken;
      delete loggedInUser.password;

      const options = {
        httpOnly: true,
        secure: true,
      };

      //!recheck this ek baar

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          message: "User successfuly created",
          user: loggedInUser,
          accessToken,
          refreshToken,
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(409).json({ message: "Some error has occured" });
  }
};

export const refreshUser = (req: Request, res: Response) => {
  
};
