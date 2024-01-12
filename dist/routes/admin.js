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
const router = express_1.default.Router();
router.get("/", (req, res) => {
    res.json({ message: "Admin API" });
});
// Admin routes
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { FirstName, LastName, email, password } = req.body;
    const admin = yield db_1.Admin.findOne({ email });
    if (admin) {
        res.status(403).json({ message: "Admin already exists" });
    }
    else {
        const newAdmin = new db_1.Admin({ FirstName, LastName, email, password });
        newAdmin.save();
        // const token = jwt.sign({ email, role: 'admin' }, SECRET as string, { expiresIn: '1h' });
        // res.json({ message: 'Admin created successfully', token });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.headers;
    const admin = yield db_1.Admin.findOne({ email, password });
    // if (admin) {
    // 	const token = jwt.sign({ email, role: 'admin' }, SECRET as string, { expiresIn: '1h' });
    // 	res.json({ message: 'Logged in successfully', token });
    // } else {
    // 	res.status(403).json({ message: 'Invalid Admin credentials' });
    // }
}));
router.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers["email"];
    console.log("**TS**");
    //find FirstName from the Admins collection
    const FirstName = yield db_1.Admin.findOne({ email: email }).select("FirstName -_id");
    res.json(FirstName);
}));
// create course
router.post("/courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //adding a new course to the courses collection
    const email = req.headers["email"];
    const course = new db_1.Course(req.body);
    const adminDetails = yield db_1.Admin.findOne({ email: email }).select("_id FirstName LastName");
    course.publishedBy.push(adminDetails);
    yield course.save();
    yield db_1.Admin.findOneAndUpdate({ email: email }, { $push: { createdCourses: course } });
    res.json({ message: "Course created successfully", courseId: course.id });
}));
router.put("/courses/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield db_1.Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });
    if (course) {
        res.json({ message: "Course updated successfully" });
    }
    else {
        res.status(404).json({ message: "Course not found" });
    }
}));
router.get("/courses", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers["email"];
    const courses = yield db_1.Admin.findOne({ email: email }).populate("createdCourses");
    if (courses) {
        res.json({ courses: courses.createdCourses || [] });
    }
    else {
        res.status(404).json({ message: "no courses found" });
    }
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
router.delete("/courses/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.headers["email"];
    yield db_1.Course.findByIdAndDelete(req.params.courseId);
    yield db_1.Admin.findOneAndUpdate({ email: email }, { $pull: { createdCourses: req.params.courseId } });
    res.json({ message: "Course deleted successfully" });
}));
exports.default = router;
