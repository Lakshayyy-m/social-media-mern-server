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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    followers: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "users" }],
    following: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "users" }],
    profileImg: { type: String },
    bio: { type: String },
    refreshToken: { type: String },
}, { timestamps: true });
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password"))
            return next();
        this.password = yield bcrypt_1.default.hash(this.password, 10);
    });
});
UserSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return bcrypt_1.default.compare(password, this.password);
    });
};
UserSchema.methods.generateAccessToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return jsonwebtoken_1.default.sign({
            _id: this.id,
            email: this.email,
            username: this.username,
            password: this.password,
        }, process.env.TOKEN_SECRET, {
            expiresIn: "2d",
        });
    });
};
UserSchema.methods.generateRefreshToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return jsonwebtoken_1.default.sign({
            _id: this.id,
        }, process.env.TOKEN_SECRET, {
            expiresIn: "20d",
        });
    });
};
exports.User = ((_a = mongoose_1.default.models) === null || _a === void 0 ? void 0 : _a.users) || mongoose_1.default.model("user", UserSchema);
//!creating users so that to map them to the posts and then further render posts on the frontend
