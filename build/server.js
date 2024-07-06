"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
//Database connection
mongoose_1.default.connect(process.env.MONGO_URL).then(() => {
    console.log("Mongo Connected");
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api/posts", posts_1.default);
app.use("/api/user", users_1.default);
app.use((error, req, res, next) => {
    if (req.headerSent) {
        next(error);
    }
});
app.listen(5000, () => {
    console.log("Server is running");
});
