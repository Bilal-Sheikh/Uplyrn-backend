import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user";

require("dotenv").config();

const app = express();
// Use the environment variable or default to 3000
const port = process.env.PORT || 3001;

app.use(express.json());

app.use(
    cors({
        credentials: true,
        origin: "*",
    })
);

app.use("/admin", adminRouter);
app.use("/user", userRouter);

// Connect to MongoDB using the environment variable
mongoose
    .connect(process.env.MONGODB_URI as string, { dbName: "course-seller" })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
    });

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
