import express from "express";
import {
  loginUser,
  logoutUser,
  signUpUser,
} from "../controllers/auth-controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", loginUser);

router.post("/signup", signUpUser);

//secured routes
router.post("/logout", verifyJWT, logoutUser);

export default router;
