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
exports.searchUserByUsernameOrName = exports.getUserById = void 0;
const User_1 = require("../db/models/User");
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_1.User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("from getUserById", user);
        return res.status(200).json({ user });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserById = getUserById;
const searchUserByUsernameOrName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { value } = req.params;
    let users;
    try {
        users = yield User_1.User.aggregate().search({
            index: "Search_Index",
            text: {
                query: value,
                path: ["username", "name"],
            },
        });
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "Could not find users as of now. Try again later" });
    }
    return res.status(200).json({ users });
});
exports.searchUserByUsernameOrName = searchUserByUsernameOrName;
