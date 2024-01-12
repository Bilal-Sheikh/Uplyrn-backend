import express from "express";
import { User, Course, Payment } from "../db";
require("dotenv").config();

const KEY_ID = process.env.RAZORPAY_API_KEY;
const KEY_SECRET = process.env.RAZORPAY_API_SECRET;

const router = express.Router();

router.get("/", (req, res) => {
    res.json({ message: "User API" });
});

// USER ROUTES
router.post("/signup", async (req, res) => {
    const { FirstName, LastName, email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
        res.status(400).json({ message: "User already exists" });
    } else {
        const newUser = new User({ FirstName, LastName, email, password });
        newUser.save();
        // const token = jwt.sign({ email, role: "user" }, SECRET as string, {
        //     expiresIn: "1h",
        // });
        // res.json({ message: "User created successfully", token });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.headers;
    const user = await User.findOne({ email, password });

    // if (user) {
    //     const token = jwt.sign({ email, role: "user" }, SECRET as string, {
    //         expiresIn: "1h",
    //     });
    //     res.json({ message: "Logged in successfully", token });
    // } else {
    //     res.status(403).json({ message: "Invalid User credentials" });
    // }
});

router.get("/me", async (req, res) => {
    //find FirstName from the Users collection
    const email = req.headers["email"];
    console.log("**TS**");

    const FirstName = await User.findOne({ email: email }).select(
        "FirstName -_id"
    );
    res.json(FirstName);
});

router.get("/courses", async (req, res) => {
    const courses = await Course.find({ published: true });
    res.json({ courses: courses });
});

router.get("/courses/:courseId", async (req, res) => {
    const courseID = await Course.findById(req.params.courseId);
    if (courseID) {
        res.json(courseID);
    } else {
        res.json({ message: "Wrong Course ID" });
    }
});

//purchaseCourse
router.post("/courses/:courseId", async (req, res) => {
    const email = req.headers["email"];

    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res
                .status(404)
                .json({ message: "Course not found or not available" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if course is already present in the user's purchasedCourses
        // const isPurchased = await User.findOne({ email: email, purchasedCourses: course._id })
        const isPurchased = user.purchasedCourses.some((courseId) =>
            courseId.equals(course._id)
        );

        if (isPurchased) {
            return res
                .status(400)
                .json({ message: "Course already purchased" });
        } else {
            user.purchasedCourses.push(course._id); // Push the course's _id instead of the whole course document
            await user.save();

            res.json({ message: "Course purchased successfully" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal server error while purchasing course",
        });
    }
});

router.get("/purchasedCourses", async (req, res) => {
    const email = req.headers["email"];

    const user = await User.findOne({ email: email }).populate(
        "purchasedCourses"
    );
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.json({ purchasedCourses: user.purchasedCourses || [] });
});

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

export default router;
