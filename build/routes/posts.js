"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const posts_controller_1 = require("../controllers/posts-controller");
const router = express_1.default.Router();
router.get("/getAllPosts", (req, res) => {
    return res.json({ message: "posts page" });
});
router.get("/create-post", posts_controller_1.createPost);
exports.default = router;
