import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../db/models/User";
import { any } from "zod";

type jwtPayload = {
  _id: string;
};

export const verifyJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as jwtPayload;
  } catch (error: any) {
    console.log(error);
    if (error.name === "TokenExpiredError") {
    }
  }

  //!If token is expired then refresh it.
  try {
    const user = await User.findById(decodedToken!._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Some error occured at our end please try again" });
  }
};
