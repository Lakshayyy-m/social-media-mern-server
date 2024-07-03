"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = void 0;
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
