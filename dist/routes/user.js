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
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
require("dotenv").config();
const KEY_ID = process.env.RAZORPAY_API_KEY;
const KEY_SECRET = process.env.RAZORPAY_API_SECRET;
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.json({ message: "User API" });
});
// USER ROUTES
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { FirstName, LastName, email, password } = req.body;
    const user = yield db_1.User.findOne({ email });
    if (user) {
        res.status(400).json({ message: "User already exists" });
    }
    else {
        const newUser = new db_1.User({ FirstName, LastName, email, password });
        newUser.save();
        // const token = jwt.sign({ email, role: "user" }, SECRET as string, {
        //     expiresIn: "1h",
        // });
        // res.json({ message: "User created successfully", token });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.headers;
    const user = yield db_1.User.findOne({ email, password });
    // if (user) {
    //     const token = jwt.sign({ email, role: "user" }, SECRET as string, {
    //         expiresIn: "1h",
    //     });
    //     res.json({ message: "Logged in successfully", token });
    // } else {
    //     res.status(403).json({ message: "Invalid User credentials" });
    // }
}));
router.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //find FirstName from the Users collection
    const email = req.headers["email"];
    console.log("**TS**");
    const FirstName = yield db_1.User.findOne({ email: email }).select("FirstName -_id");
    res.json(FirstName);
}));
router.get("/courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield db_1.Course.find({ published: true });
    res.json({ courses: courses });
}));
router.get("/courses/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseID = yield db_1.Course.findById(req.params.courseId);
    if (courseID) {
        res.json(courseID);
    }
    else {
        res.json({ message: "Wrong Course ID" });
    }
}));
//purchaseCourse
router.post("/courses/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers["email"];
    try {
        const course = yield db_1.Course.findById(req.params.courseId);
        if (!course) {
            return res
                .status(404)
                .json({ message: "Course not found or not available" });
        }
        const user = yield db_1.User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if course is already present in the user's purchasedCourses
        // const isPurchased = await User.findOne({ email: email, purchasedCourses: course._id })
        const isPurchased = user.purchasedCourses.some((courseId) => courseId.equals(course._id));
        if (isPurchased) {
            return res
                .status(400)
                .json({ message: "Course already purchased" });
        }
        else {
            user.purchasedCourses.push(course._id); // Push the course's _id instead of the whole course document
            yield user.save();
            res.json({ message: "Course purchased successfully" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error while purchasing course",
        });
    }
}));
router.get("/purchasedCourses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers["email"];
    const user = yield db_1.User.findOne({ email: email }).populate("purchasedCourses");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ purchasedCourses: user.purchasedCourses || [] });
}));
// router.post("/orders", (req, res) => {
//     const instance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
//     const options = {
//         amount: Number(req.body.amount * 100), // amount in the smallest currency unit
//         currency: "INR",
//     };
//     instance.orders.create(options, function (err: any, order: any) {
//         if (err) {
//             res.status(500).json({ message: "Server Err" });
//         } else {
//             res.json({ message: "Order created", order: order });
//         }
//     });
// });
// router.post("/verify", async (req, res) => {
//     const email = req.headers["email"];
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//         req.body.response;
//     const body = razorpay_order_id + "|" + razorpay_payment_id;
//     const expectedSignature = crypto
//         .createHmac("sha256", KEY_SECRET)
//         .update(body.toString())
//         .digest("hex");
//     const isAuthentic = expectedSignature === razorpay_signature;
//     if (isAuthentic) {
//         const payment = new Payment({
//             razorpay_order_id,
//             razorpay_payment_id,
//             razorpay_signature,
//             email: email,
//         });
//         payment.save();
//         res.status(200).json({
//             message: "SIGN VALID",
//             paymentID: razorpay_payment_id,
//             orderID: razorpay_order_id,
//         });
//     } else {
//         res.status(400).json({
//             message: "SIGN INVALID",
//         });
//     }
// });
exports.default = router;
