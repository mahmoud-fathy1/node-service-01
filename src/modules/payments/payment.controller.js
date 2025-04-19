import Payment from "./payment.model.js";
import userModel from "../users/user.model.js";
import Course from "../courses/course.model.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export const fetchPaymentMethods = async (req, res) => {
	try {
		const response = await axios.get("https://app.fawaterk.com/api/v2/getPaymentmethods", {
			headers: {
				Authorization: `Bearer ${process.env.FAWATERK_API_KEY}`,
				"Content-Type": "application/json",
			},
		});
		return res.status(200).json(response.data);
	} catch (error) {
		return res.status(500).json({
			message: "Error fetching payment methods.",
		});
	}
};
export const getTransactionData = async (req, res) => {
	const { invoiceId } = req.params;
	if (!invoiceId) {
		return res.status(400).json({
			message: "Invoice ID is required.",
		});
	}
	try {
		const response = await axios.get(`https://app.fawaterk.com/api/v2/getInvoiceData/${invoiceId}`, {
			headers: {
				Authorization: `Bearer ${process.env.FAWATERK_API_KEY}`,
				"Content-Type": "application/json",
			},
		});
		return res.status(200).json(response.data);
	} catch (error) {
		return res.status(500).json({
			message: "Error fetching transaction data.",
		});
	}
};
export const getAllPayments = async (req, res) => {
	try {
		const payments = await Payment.find().populate("user", "firstName lastName phoneNumber").populate("course", "title");
		return res.status(200).json(payments);
	} catch (error) {
		return res.status(500).json({
			message: "Error fetching payments.",
		});
	}
};
export const getPaymentsByUser = async (req, res) => {
	const { id } = req.params;
	try {
		const user = await userModel.findById(id);
		if (!user) {
			return res.status(404).json({
				message: "User not found.",
			});
		}
		const payments = await Payment.find({
			userId: user._id,
		}).populate("course", "title");
		return res.status(200).json(payments);
	} catch (error) {
		return res.status(500).json({
			message: "Error fetching payments for user.",
		});
	}
};
export const getPaymentsByCourse = async (req, res) => {
	const { courseId } = req.params;
	try {
		const payments = await Payment.find({
			courseId: courseId,
		}).populate("user", "firstName lastName phoneNumber");
		return res.status(200).json(payments);
	} catch (error) {
		return res.status(500).json({
			message: "Error fetching payments for course.",
		});
	}
};
