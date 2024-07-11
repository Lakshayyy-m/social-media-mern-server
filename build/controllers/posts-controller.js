"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsByUserId = exports.createPost = void 0;
const Post_1 = require("../db/models/Post");
const createPost = (req, res) => {
    const {} = req.body;
    try {
        const newPost = Post_1.Post.create({});
    }
    catch (error) {
        console.log(error);
    }
};
exports.createPost = createPost;
const getPostsByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield Post_1.Post.find({ userId: req.params.id });
        if (!posts) {
            return res.status(200).json({ message: "No Posts", posts: [] });
        }
        return res.status(200).json({ posts });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error fetching posts" });
    }
});
exports.getPostsByUserId = getPostsByUserId;
