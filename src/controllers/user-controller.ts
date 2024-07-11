import { Request, Response } from "express";
import { User } from "../db/models/User";

export const getUserById = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("from getUserById", user);
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchUserByUsernameOrName = async (
  req: Request,
  res: Response
) => {
  const { value } = req.params;
  let users;

  try {
    users = await User.aggregate().search({
      index: "Search_Index",
      text: {
        query: value,
        path: ["username", "name"],
      },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Could not find users as of now. Try again later" });
  }

  return res.status(200).json({ users });
};
