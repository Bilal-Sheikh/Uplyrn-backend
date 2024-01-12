"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.Course = exports.User = exports.Admin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
//user schema
const userSchema = new mongoose_1.default.Schema({
    FirstName: String,
    LastName: String,
    email: String,
    password: String,
    purchasedCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course' }]
});
//admin schema
const adminSchema = new mongoose_1.default.Schema({
    FirstName: String,
    LastName: String,
    email: String,
    password: String,
    createdCourses: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Course' }]
});
//courses schema
const courseSchema = new mongoose_1.default.Schema({
    title: String,
    description: String,
    price: Number,
    imageLink: String,
    published: Boolean,
    publishedBy: Array,
});
const paymentSchema = new mongoose_1.default.Schema({
    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,
    email: String
});
//make models
exports.Admin = mongoose_1.default.model('Admin', adminSchema);
exports.User = mongoose_1.default.model('User', userSchema);
exports.Course = mongoose_1.default.model('Course', courseSchema);
exports.Payment = mongoose_1.default.model('Payment', paymentSchema);
