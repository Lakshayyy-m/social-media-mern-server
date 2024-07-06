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
exports.checkAuth = exports.refreshUser = exports.signUpUser = exports.logoutUser = exports.loginUser = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_1 = require("../utils/validation");
const User_1 = require("../db/models/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    //data validated
    const result = validation_1.userSchema.safeParse(data);
    if (!result.success) {
        return res.status(403).json({ message: result.error.issues[0].message }); //!error 403 for invalid data
    }
    try {
        let user;
        if (data.username) {
            user = yield User_1.User.findOne({ username: data.username });
        }
        else if (data.email) {
            user = yield User_1.User.findOne({ email: data.email });
        }
        //checking user existence in database
        if (!user) {
            return res
                .status(302)
                .json({ message: "User does not exist, kindly sign up first" }); //!error 403 is sent to redirect user to redirect page
        }
        //verifying password
        if (!(yield user.isPasswordCorrect(data.password))) {
            return res.status(401).json({ message: "Invalid user credentials" });
        }
        //generating tokens
        const accessToken = yield user.generateAccessToken();
        const refreshToken = yield user.generateRefreshToken();
        user.refreshToken = refreshToken;
        yield user.save({ validateBeforeSave: false });
        const loggedInUser = user;
        loggedInUser.refreshToken = undefined;
        loggedInUser.password = undefined;
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
            message: "User successfuly logged in",
            user: loggedInUser,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "Some error occured" });
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        yield User_1.User.findByIdAndUpdate(userId, {
            $set: {
                refreshToken: undefined,
            },
        }, {
            new: true,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "Could not logout" });
    }
    const options = {
        httpOnly: true,
        secure: true,
    };
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({ message: "You are successfully logged out!" });
});
exports.logoutUser = logoutUser;
const signUpUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    //data validation
    if (!data.username || !data.email || !data.fullname) {
        return res
            .status(403)
            .json({ message: "All username, Full name and email are needed" });
    }
    const result = validation_1.userSchema.safeParse(data);
    if (!result.success) {
        return res.status(403).json({ message: result.error.issues[0].message }); //!error 403 for invalid data
    }
    try {
        //checking for email existence
        const user = yield User_1.User.findOne({ email: data.email });
        if (user && (user === null || user === void 0 ? void 0 : user.username) !== data.username) {
            return res.status(401).json({ message: "E-mail already exists" });
        }
        //checking for username existance
        const user2 = yield User_1.User.findOne({ username: data.username });
        if (user2 && (user2 === null || user2 === void 0 ? void 0 : user2.email) !== data.email) {
            return res.status(401).json({ message: "Username already exists" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(409).json({ message: "Some error has occured" });
    }
    try {
        const user = yield User_1.User.findOne({
            email: data.email,
            username: data.username,
        });
        //checking for user existence
        if (!user) {
            //implement signup
            const safePassword = yield bcrypt_1.default.hash(data.password, 10);
            const newUser = yield User_1.User.create({
                name: data.fullname,
                username: data.username,
                email: data.email,
                password: safePassword,
                bio: "",
                profileImg: "",
            });
            const accessToken = yield newUser.generateAccessToken();
            const refreshToken = yield newUser.generateRefreshToken();
            newUser.refreshToken = refreshToken;
            yield newUser.save();
            const options = {
                httpOnly: true,
                secure: true,
            };
            newUser.refreshToken = undefined;
            newUser.password = undefined;
            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json({
                message: "User successfully created",
                user: newUser,
                accessToken,
                refreshToken,
            });
            //!also implmement redirect of user
        }
        else {
            //implement login
            //verifying password
            if (!(yield user.isPasswordCorrect(data.password))) {
                return res.status(401).json({
                    message: "User already exists, but could not login due to invalid credentials",
                });
            }
            //generating tokens
            const accessToken = yield user.generateAccessToken();
            const refreshToken = yield user.generateRefreshToken();
            user.refreshToken = refreshToken;
            yield user.save({ validateBeforeSave: false });
            const loggedInUser = user;
            loggedInUser.refreshToken = undefined;
            loggedInUser.password = undefined;
            const options = {
                httpOnly: true,
                secure: true,
            };
            //!recheck this ek baar
            return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json({
                message: "User successfuly logged in",
                user: loggedInUser,
                accessToken,
                refreshToken,
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(409).json({ message: "Some error has occured" });
    }
});
exports.signUpUser = signUpUser;
const refreshUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingToken) {
        return res.status(401).json({ message: "Unauthorized Request" });
    }
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.default.verify(incomingToken, process.env.TOKEN_SECRET);
    }
    catch (error) {
        console.log(error);
        if (error.name === "TokenExpiredError") {
            return res
                .status(403)
                .json({ message: "Unauthorized Access, Kindly Re-login" }); //Even refresh token not valid anymore
        }
    }
    try {
        const user = yield User_1.User.findById(decodedToken._id);
        if (!user) {
            return res
                .status(401)
                .json({ message: "Unauthorized Request, Invalid Token" });
        }
        if (incomingToken !== user.refreshToken) {
            return res.status(401).json({ message: "Refresh Token expired" });
        }
        const accessToken = yield user.generateAccessToken();
        const refreshToken = yield user.generateRefreshToken();
        user.refreshToken = refreshToken;
        yield user.save({ validateBeforeSave: false });
        const loggedInUser = user;
        delete loggedInUser.refreshToken;
        delete loggedInUser.password;
        const options = {
            httpOnly: true,
            secure: true,
        };
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json({
            message: "User successfuly logged in",
            user: loggedInUser,
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(404).json({ message: "Some error occured" });
    }
});
exports.refreshUser = refreshUser;
//for checking authentication on mounting of application
const checkAuth = (req, res) => {
    return res.status(200).json({ status: true, user: req.user });
};
exports.checkAuth = checkAuth;
