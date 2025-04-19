import Course from "./course.model.js";
import userModel from "../users/user.model.js";
import Payment from "../payments/payment.model.js";
import { generateBatchOfUniqueCodes } from "./course.service.js";
import axios from "axios";
import cloudinary from "../../utils/cloudinary.js";
import dotenv from "dotenv";
dotenv.config();

export const createCourse = async (req, res, next) => {
	const { title, description, price, duration, classGrade, isFree } = req.body;
	let public_id;
	try {
		if (isFree && price && price > 0) {
			return next(new Error("Free courses must have a price of 0 or no price"), {
				cause: 400,
			});
		}

		if (
			await Course.findOne({
				title,
			})
		) {
			return next(
				new Error("Course name is already taken", {
					cause: 400,
				})
			);
		}

		if (!req.file) {
			return next(
				new Error("Please upload course image", {
					cause: 400,
				})
			);
		}

		const uploadResult = await cloudinary.uploader.upload(req.file.path, {
			folder: `${process.env.PROJECTCLOUDFOLDER}/Courses`,
		});
		public_id = uploadResult.public_id;
		const secure_url = uploadResult.secure_url;

		const createCourse = await Course.create({
			title,
			description,
			price: isFree ? 0 : price,
			duration,
			classGrade,
			isFree,
			purchaseCodes: [],
			image: {
				public_id,
				secure_url,
			},
		});

		// Handle failure to create course
		if (!createCourse) {
			await cloudinary.uploader.destroy(public_id);
			return next(new Error("Error while creating the course"), {
				cause: 400,
			});
		}

		res.status(201).json({
			message: "Course created successfully",
			createCourse,
		});
	} catch (error) {
		// Clean up the uploaded image in case of an error
		if (public_id) {
			await cloudinary.uploader.destroy(public_id);
		}
		res.status(500).json({
			message: "Failed to create course",
			error: error.message,
		});
	}
};
export const getAllCourses = async (req, res) => {
	const { classGrade } = req.query;
	try {
		const query = classGrade
			? {
					classGrade,
				}
			: {};
		const courses = await Course.find(query);
		res.status(200).json(courses);
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch courses",
			error: error.message,
		});
	}
};
export const getCourseById = async (req, res) => {
	const { id } = req.params;
	try {
		const course = await Course.findById(id).populate({
			path: "enrolledStudents.student",
			select: "fName lName phoneNumber",
		});
		if (!course) {
			return res.status(404).json({
				message: "Course not found",
			});
		}
		res.status(200).json(course);
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch course",
			error: error.message,
		});
	}
};
export const updateCourse = async (req, res) => {
	const { id } = req.params;
	try {
		const updatedCourse = await Course.findByIdAndUpdate(id, req.body, {
			new: true,
		});
		if (!updatedCourse) {
			return res.status(404).json({
				message: "Course not found",
			});
		}
		if (req.file) {
			const OldPublic = updatedCourse.image.public_id;
			const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
				folder: `${process.env.PROJECTCLOUDFOLDER}/Courses`,
			});
			updatedCourse.image.public_id = public_id;
			updatedCourse.image.secure_url = secure_url;
			await updatedCourse.save();
			await cloudinary.uploader.destroy(OldPublic);
		}
		res.status(200).json({
			message: "Course updated successfully",
			course: updatedCourse,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to update course",
			error: error.message,
		});
	}
};
export const deleteCourse = async (req, res) => {
	const { id } = req.params;
	try {
		const deletedCourse = await Course.findByIdAndDelete(id);
		await cloudinary.uploader.destroy(deletedCourse.image.public_id);
		if (!deletedCourse) {
			return res.status(404).json({
				message: "Course not found",
			});
		}
		res.status(200).json({
			message: "Course deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to delete course",
			error: error.message,
		});
	}
};
export const purchaseCourse = async (req, res) => {
	const { courseId, paymentId, amount } = req.body;
	const userId = req.user.id;

	console.log("Fawaterk API Key:", process.env.FAWATERK_API_KEY);

	console.log("Incoming Request Data:", { courseId, paymentId, amount, userId });

	if (!courseId) {
		console.log("Error: courseId is missing.");
		return res.status(400).json({
			message: "Missing required fields: courseId is required.",
		});
	}

	try {
		const user = await userModel.findById(userId);
		if (!user) {
			console.log("Error: User not found.");
			return res.status(404).json({
				message: "User not found.",
			});
		}
		console.log("User found:", user);

		let alreadyPurchased = user.purchasedCourses.some((purchase) => purchase.course.toString() === courseId);
		if (alreadyPurchased) {
			console.log("Error: User has already purchased the course.");
			return res.status(400).json({
				message: "You have already purchased/enrolled in this course.",
			});
		}

		const course = await Course.findById(courseId);
		if (!course) {
			console.log("Error: Course not found.");
			return res.status(404).json({
				message: "Course not found.",
			});
		}
		console.log("Course found:", course);

		// Check for free course
		if (course.isFree) {
			console.log("Enrolling in free course.");
			user.purchasedCourses.push({
				course: courseId,
				purchaseDate: new Date(),
				purchaseCode: null,
				payments: [],
			});
			await user.save();
			console.log("Successfully enrolled in free course.");
			return res.status(201).json({
				message: "Successfully enrolled in the free course.",
				course,
			});
		}

		if (!paymentId || !amount) {
			console.log("Error: Missing required fields for paid course.");
			return res.status(400).json({
				message: "Missing required fields for paid course (paymentId, amount).",
			});
		}

		const cleanString = (str) => str.replace(/[^\p{L}\p{N}@\-_.\s]/gu, "").trim();

		const sanitizedFirstName = cleanString(user.fName);
		const sanitizedLastName = cleanString(user.lName);

		console.log("Sanitized First Name:", sanitizedFirstName); // Debug log
		console.log("Sanitized Last Name:", sanitizedLastName); // Debug log

		const paymentData = {
			payment_method_id: paymentId,
			cartTotal: amount.toString(),
			currency: "EGP",
			customer: {
				first_name: sanitizedFirstName,
				last_name: sanitizedLastName,
				email: user.email,
				phone: user.phoneNumber,
				address: "test address", // Optional, but provide if available
			},
			cartItems: [
				{
					name: course.title,
					price: amount.toString(),
					quantity: "1",
				},
			],
		};

		console.log("Sending payment data to Fawaterk:", paymentData);

		// Make payment request to Fawaterk
		const paymentResponse = await axios.post("https://app.fawaterk.com/api/v2/invoiceInitPay", paymentData, {
			headers: {
				Authorization: `Bearer ${process.env.FAWATERK_API_KEY}`,
				"Content-Type": "application/json",
			},
		});

		const paymentDetails = paymentResponse.data.data;
		console.log("Payment response received from Fawaterk:", paymentDetails);

		// Save payment to DB
		const payment = new Payment({
			userId: userId,
			courseId: courseId,
			invoiceId: paymentDetails.invoice_id,
			invoiceKey: paymentDetails.invoice_key,
			paymentData: paymentDetails.payment_data,
			amount: amount,
			currency: "EGP",
			status: "pending",
			paymentMethod: paymentId === 2 ? "Visa-Mastercard" : "Fawry",
		});
		await payment.save();
		console.log("Payment saved to DB:", payment);

		return res.status(201).json({
			message: "Payment initiated, awaiting confirmation.",
			paymentUrl: paymentDetails.payment_data.redirectTo || paymentDetails.payment_data.fawryCode,
			payment,
		});
	} catch (error) {
		console.log("Error during payment initiation:", error.response ? error.response.data : error.message);
		return res.status(500).json({
			message: "Error initiating payment.",
			details: error.response ? error.response.data : error.message,
		});
	}
};
export const getPurchasedCourses = async (req, res) => {
	const userId = req.user._id;
	try {
		const user = await userModel.findById(userId).populate("purchasedCourses");
		res.status(200).json(user.purchasedCourses);
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch purchased courses",
			error: error.message,
		});
	}
};
export const updateUserProgress = async (req, res) => {
	const { courseId, quizId, completed } = req.body;
	const userId = req.user._id;
	try {
		const user = await userModel.findById(userId);
		const progress = user.courseProgress || {};
		if (!progress[courseId]) {
			progress[courseId] = {
				quizzes: [],
				completed: false,
			};
		}
		if (!progress[courseId].quizzes.includes(quizId)) {
			progress[courseId].quizzes.push(quizId);
		}
		const course = await Course.findById(courseId);
		const allQuizzesCompleted = progress[courseId].quizzes.length === course.lessons.length;
		if (allQuizzesCompleted && completed) {
			progress[courseId].completed = true;
		}
		user.courseProgress = progress;
		await user.save();
		res.status(200).json({
			message: "Progress updated successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to update progress",
			error: error.message,
		});
	}
};
export const getCourseProgress = async (req, res) => {
	const { courseId } = req.params;
	const userId = req.user._id;
	try {
		const user = await userModel.findById(userId);
		const progress = user.courseProgress?.[courseId] || {
			quizzes: [],
			completed: false,
		};
		res.status(200).json({
			progress,
		});
	} catch (error) {
		res.status(500).json({
			message: "Failed to fetch progress",
			error: error.message,
		});
	}
};
export const createPurchaseCode = async (req, res) => {
	try {
		const { courseId, count = 1 } = req.body;
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(404).json({
				message: "Course not found",
			});
		}

		// Generate multiple codes with their creation date
		const codes = await generateBatchOfUniqueCodes(courseId, count);

		return res.status(200).json({
			message: `${count} Purchase code(s) generated successfully`,
			codes: codes.map(({ code, createdAt }) => ({ code, createdAt })),
		});
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});
	}
};
export const purchaseCourseByCode = async (req, res) => {
	try {
		const { code } = req.body;
		const userId = req.user.id;
		const course = await Course.findOne({
			"purchaseCodes.code": code,
		});
		if (!course) {
			return res.status(404).json({
				message: "Invalid code or code not found.",
			});
		}
		const codeDetails = course.purchaseCodes.find((purchaseCode) => purchaseCode.code === code);
		if (!codeDetails || codeDetails.isUsed) {
			return res.status(400).json({
				message: "This code has already been used.",
			});
		}
		const user = await userModel.findById(userId);
		const alreadyPurchased = user.purchasedCourses.some(
			(purchasedCourse) => purchasedCourse.course.toString() === course._id.toString()
		);
		if (alreadyPurchased) {
			return res.status(400).json({
				message: "You are already enrolled in this course.",
			});
		}
		await Course.updateOne(
			{
				"purchaseCodes.code": code,
			},
			{
				$set: {
					"purchaseCodes.$.isUsed": true,
					"purchaseCodes.$.userId": userId,
				},
			}
		);
		await userModel.findByIdAndUpdate(userId, {
			$addToSet: {
				purchasedCourses: {
					course: course._id,
					purchaseDate: new Date(),
					purchaseCode: code,
				},
			},
		});
		await Course.findByIdAndUpdate(course._id, {
			$addToSet: {
				enrolledStudents: {
					student: userId,
					courseCompletion: 0,
				},
			},
		});
		return res.status(200).json({
			message: "Course purchased successfully using code.",
		});
	} catch (error) {
		return res.status(500).json({
			message: "An error occurred while purchasing the course.",
			error: error.message,
		});
	}
};
