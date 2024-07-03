"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const PostSchema = new mongoose_1.default.Schema({
    uid: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "users" },
    imgUrl: String,
    comments: [
        {
            commentId: String,
            uid: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "users" },
            likesCount: Number,
            body: String,
        },
    ],
    description: String,
    likes: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "users" }],
}, { timestamps: true });
exports.Post = ((_a = mongoose_1.default.models) === null || _a === void 0 ? void 0 : _a.post) || mongoose_1.default.model("post", PostSchema, "posts");
