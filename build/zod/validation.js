"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
const zod_1 = require("zod");
exports.userSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email({ message: "Email is not valid" }).optional(),
    password: zod_1.z.string().min(8, "Password should be minimum 8 characters long"),
    username: zod_1.z.string().optional(),
});
