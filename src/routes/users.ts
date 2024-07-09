import express from "express";
import {
  checkAuth,
  loginUser,
  logoutUser,
  refreshUser,
  signUpUser,
} from "../controllers/auth-controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getUserById } from "../controllers/user-controller";

const router = express.Router();

router.post("/login", loginUser);

router.post("/signup", signUpUser);

router.post("/refreshToken", refreshUser);

//secured routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/checkAuth", verifyJWT, checkAuth);
router.get("/getUserWithId/:id", verifyJWT, getUserById);

export default router;
