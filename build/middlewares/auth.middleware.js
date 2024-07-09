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
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../db/models/User");
const verifyJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) ||
        ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
    if (!token) {
        return res.status(401).json({ message: "Unauthorized request" });
    }
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
    }
    catch (error) {
        console.log(error);
        if (error.name === "TokenExpiredError") {
            return res
                .status(403)
                .json({ message: "Unauthorized Access, Kindly Re-login" }); //Refresh token path from here
        }
    }
    try {
        const user = yield User_1.User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) {
            return res.status(401).json({ message: "Invalid access token" });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "Some error occured at our end please try again" });
    }
});
exports.verifyJWT = verifyJWT;
