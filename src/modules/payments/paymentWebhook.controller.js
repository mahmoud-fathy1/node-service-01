import crypto from "crypto";
import Payment from "./payment.model.js";
import Course from "../courses/course.model.js";
import userModel from "../users/user.model.js";
import dotenv from "dotenv";
dotenv.config();
export const handlePaymentWebhook = async (req, res) => {
	try {
		const { api_key, invoice_id, invoice_key, payment_method, invoice_status, referenceNumber } = req.body;
		if (api_key !== process.env.FAWATERK_API_KEY) {
			return res.status(403).json({
				message: "Invalid API key",
			});
		}
		const payment = await Payment.findOne({
			invoiceId: invoice_id,
			invoiceKey: invoice_key,
		});
		if (!payment) {
			return res.status(404).json({
				message: "Payment not found",
			});
		}
		if (invoice_status === "paid") {
			payment.status = "paid";
			await payment.save();
			await userModel.findByIdAndUpdate(payment.userId, {
				$addToSet: {
					purchasedCourses: {
						course: payment.courseId,
						purchaseDate: new Date(),
						purchaseCode: payment.invoiceKey,
						payments: [payment._id],
					},
				},
			});
			await Course.findByIdAndUpdate(payment.courseId, {
				$addToSet: {
					enrolledStudents: {
						student: payment.userId,
						courseCompletion: 0,
					},
				},
			});
			return res.status(200).json({
				message: "Payment status updated to paid",
			});
		}
		if (invoice_status === "failed") {
			payment.status = "failed";
			await payment.save();
			return res.status(200).json({
				message: "Payment status updated to failed",
			});
		}
		return res.status(200).json({
			message: `Payment status updated to ${invoice_status}`,
		});
	} catch (error) {
		return res.status(500).json({
			message: "Error processing webhook",
			error: error.message,
		});
	}
};
