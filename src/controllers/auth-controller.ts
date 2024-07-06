import dotenv from "dotenv";
dotenv.config();
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { userSchema } from "../utils/validation";
import { User } from "../db/models/User";
import bcrypt from "bcrypt";

export const loginUser = async (req: Request, res: Response) => {
  const data = req.body;

  //data validated
  const result = userSchema.safeParse(data);
  if (!result.success) {
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
    loggedInUser.refreshToken = undefined;
    loggedInUser.password = undefined;

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
  if (!data.username || !data.email || !data.fullname) {
    return res
      .status(403)
      .json({ message: "All username, Full name and email are needed" });
  }
  const result = userSchema.safeParse(data);
  if (!result.success) {
    return res.status(403).json({ message: result.error.issues[0].message }); //!error 403 for invalid data
  }

  try {
    //checking for email existence
    const user = await User.findOne({ email: data.email });

    if (user && user?.username !== data.username) {
      return res.status(401).json({ message: "E-mail already exists" });
    }

    //checking for username existance
    const user2 = await User.findOne({ username: data.username });
    if (user2 && user2?.email !== data.email) {
      return res.status(401).json({ message: "Username already exists" });
    }
  } catch (error) {
    console.log(error);
    return res.status(409).json({ message: "Some error has occured" });
  }

  try {
    const user = await User.findOne({
      email: data.email,
      username: data.username,
    });
    //checking for user existence
    if (!user) {
      //implement signup
      const safePassword = await bcrypt.hash(data.password, 10);
      const newUser = await User.create({
        name: data.fullname,
        username: data.username,
        email: data.email,
        password: safePassword,
        bio: "",
        profileImg: "",
        
      });
      const accessToken = await newUser.generateAccessToken();
      const refreshToken = await newUser.generateRefreshToken();
      newUser.refreshToken = refreshToken;
      await newUser.save();

      const options = {
        httpOnly: true,
        secure: true,
      };

      newUser.refreshToken = undefined;
      newUser.password = undefined;

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          message: "User successfully created",
          user: newUser,
          accessToken,
          refreshToken,
        });
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
      loggedInUser.refreshToken = undefined;
      loggedInUser.password = undefined;

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
          message: "User successfuly logged in",
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

export const refreshUser = async (req: Request, res: Response) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingToken) {
    return res.status(401).json({ message: "Unauthorized Request" });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingToken,
      process.env.TOKEN_SECRET!
    ) as JwtPayload;
  } catch (error: any) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({ message: "Unauthorized Access, Kindly Re-login" }); //Even refresh token not valid anymore
    }
  }

  try {
    const user = await User.findById(decodedToken!._id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized Request, Invalid Token" });
    }

    if (incomingToken !== user.refreshToken) {
      return res.status(401).json({ message: "Refresh Token expired" });
    }

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

//for checking authentication on mounting of application
export const checkAuth = (req: Request, res: Response) => {
  return res.status(200).json({ status: true, user: (req as any).user });
};
