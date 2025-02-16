"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth-controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = require("../controllers/user-controller");
const router = express_1.default.Router();
router.post("/login", auth_controller_1.loginUser);
router.post("/signup", auth_controller_1.signUpUser);
router.post("/refreshToken", auth_controller_1.refreshUser);
//secured routes
router.post("/logout", auth_middleware_1.verifyJWT, auth_controller_1.logoutUser);
router.post("/checkAuth", auth_middleware_1.verifyJWT, auth_controller_1.checkAuth);
router.get("/getUserWithId/:id", auth_middleware_1.verifyJWT, user_controller_1.getUserById);
router.post("/searchUser/:value", auth_middleware_1.verifyJWT, user_controller_1.searchUserByUsernameOrName);
exports.default = router;
