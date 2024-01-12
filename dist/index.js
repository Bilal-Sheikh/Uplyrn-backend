"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const admin_1 = __importDefault(require("./routes/admin"));
const user_1 = __importDefault(require("./routes/user"));
require("dotenv").config();
const app = (0, express_1.default)();
// Use the environment variable or default to 3000
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: "*",
}));
app.use("/admin", admin_1.default);
app.use("/user", user_1.default);
// Connect to MongoDB using the environment variable
mongoose_1.default
    .connect(process.env.MONGODB_URI, { dbName: "course-seller" })
    .then(() => {
    console.log("Connected to MongoDB");
})
    .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
