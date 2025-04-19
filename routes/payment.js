import express from "express";
import {
    fetchPaymentMethods,
    getTransactionData,
    getAllPayments,
    getPaymentsByUser,
    getPaymentsByCourse,
} from "../src/Modules/payments/payment.controller.js";
import { handlePaymentWebhook } from "../src/Modules/payments/paymentWebhook.controller.js";
import { isAuth, roles } from "../src/middlewares/auth.js";

const router = express.Router();

// Route to fetch payment methods
router.get("/methods", isAuth([roles.Admin, roles.User]), fetchPaymentMethods);

// Route to get transaction data
router.get("/transaction/:invoiceId", isAuth([roles.Admin, roles.User]), getTransactionData);

// Admin Routes
router.get("/", isAuth([roles.Admin]), getAllPayments); // Get all payments
router.get("/course/:courseId", isAuth([roles.Admin]), getPaymentsByCourse); // Get payments for a specific course
router.get("/user/:id", getPaymentsByUser); // Route to get payments by user ID
router.post("/webhook_json", handlePaymentWebhook); // Route for updating the payment status

// Success and failure dummy routes
router.get("/success", function (req, res) {
    res.send("Payment succeeded");
});
router.get("/fail", function (req, res) {
    res.send("Payment failed");
});
router.get("/pending", function (req, res) {
    res.send("Payment pending...");
});

export default router;
