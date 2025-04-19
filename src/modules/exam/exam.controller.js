import userModel from "../users/user.model.js";
import cloudinary from "../../utils/cloudinary.js";
import Course from "../courses/course.model.js";
import lessonModel from "../lessons/lesson.model.js";
import examModel from "./exam.model.js";
import mongoose from "mongoose";
export const createExam = async (req, res, next) => {
	const uploadedPublicIds = [];
	try {
		const { title, courseId, lessonId, duration } = req.body;
		const course = await Course.findById(courseId);
		if (!course) {
			return res.status(400).json({
				error: true,
				message: "Invalid Course ID",
			});
		}
		// If lessonId is provided, validate it
		let lesson;
		if (lessonId) {
			lesson = await lessonModel.findById(lessonId);
			if (!lesson) {
				return res.status(400).json({
					error: true,
					message: "Invalid Lesson ID",
				});
			}
		}
		if (!duration || duration <= 0) {
			return res.status(400).json({ error: true, message: "Invalid exam duration" });
		}
		const questions = [];
		for (let QIndex = 0; QIndex < req.body.question.length; QIndex++) {
			const question = req.body.question[QIndex];
			const questionData = {
				questionTitle: question.questionTitle,
				options: question.options,
				answer: question.answer,
			};
			const fileField = `question[${QIndex}][questionImage]`;
			const file = req.files.find((f) => f.fieldname === fileField);
			if (file) {
				const uploadResult = await cloudinary.uploader.upload(file.path, {
					folder: `${process.env.PROJECTCLOUDFOLDER}/Exams/Questions`,
				});
				questionData.questionImage = {
					public_id: uploadResult.public_id,
					secure_url: uploadResult.secure_url,
				};
				uploadedPublicIds.push(uploadResult.public_id);
			} else {
			}
			questions.push(questionData);
		}
		const exam = await examModel.create({
			title,
			courseId,
			lessonId,
			question: questions,
			duration,
			createdBy: req.user._id,
		});
		if (!exam) {
			for (let public_id of uploadedPublicIds) {
				await cloudinary.uploader.destroy(public_id);
			}
			return next(new Error("Error While Creating The Exam"), {
				cause: 400,
			});
		}
		res.status(201).json({
			success: true,
			message: "Exam created successfully",
			exam,
		});
	} catch (error) {
		for (let public_id of uploadedPublicIds) {
			await cloudinary.uploader.destroy(public_id);
		}
		res.status(500).json({
			error: true,
			message: "Failed to create exam",
		});
	}
};
export const getExams = async (req, res) => {
	const { title, createdBy, courseId, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = req.query;
	const query = {};

	if (title) query.title = title;
	if (createdBy) query.createdBy = createdBy;

	// Add filtering by courseId if it's provided in the query
	if (courseId) query.courseId = courseId;

	try {
		const exams = await examModel
			.find(query)
			.skip((page - 1) * limit)
			.limit(Number(limit))
			.sort({
				[sortBy]: sortOrder === "desc" ? -1 : 1,
			})
			.populate("courseId", "title")
			.populate("lessonId", "lessonName")
			.populate("createdBy", "email");

		const totalExams = await examModel.countDocuments(query);
		res.status(200).json({
			success: true,
			exams,
			total: totalExams,
			page: Number(page),
			limit: Number(limit),
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: "Failed to fetch exams",
		});
	}
};
export const getExamById = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({
			error: true,
			message: "Invalid exam ID",
		});
	}
	try {
		const exam = await examModel
			.findById(id)
			.populate("courseId", "title")
			.populate("lessonId", "lessonName")
			.populate("createdBy", "email");
		if (!exam) {
			return res.status(404).json({
				error: true,
				message: "Exam not found",
			});
		}
		// Check if the user is enrolled in the course
		const user = await userModel.findById(req.user._id);
		const isEnrolled = user.purchasedCourses.some(
			(courseObj) => courseObj.course.toString() === exam.courseId._id.toString()
		);

		if (!isEnrolled) {
			return res.status(403).json({
				message: "You are not enrolled in this course and cannot access this exam.",
			});
		}
		res.status(200).json({
			success: true,
			exam,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: "Failed to fetch exam",
		});
	}
};
export const updateExam = async (req, res) => {
	const { id } = req.params;
	const { title, courseId, lessonId, question } = req.body;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({
			error: true,
			message: "Invalid exam ID",
		});
	}
	try {
		const updatedExam = await examModel.findOneAndUpdate(
			{
				_id: id,
			},
			{
				title,
				courseId,
				lessonId,
				question,
			},
			{
				new: true,
				runValidators: true,
			}
		);
		if (!updatedExam) {
			return res.status(404).json({
				error: true,
				message: "Exam not found",
			});
		}
		if (req.file || req.files) {
			const OldPublic = updatedExam.questionImage.public_id;
			const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, {
				folder: `${process.env.PROJECTCLOUDFOLDER}/Exams/Questions`,
			});
			updatedExam.questionImage.public_id = public_id;
			updatedExam.questionImage.secure_url = secure_url;
			await updatedExam.save();
			await cloudinary.uploader.destroy(OldPublic);
		}
		res.status(200).json({
			success: true,
			message: "Exam updated successfully",
			exam: updatedExam,
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: "Failed to update exam",
		});
	}
};
export const deleteExam = async (req, res) => {
	const { id } = req.params;
	if (!mongoose.Types.ObjectId.isValid(id)) {
		return res.status(400).json({
			error: true,
			message: "Invalid exam ID",
		});
	}
	try {
		const deletedExam = await examModel.findByIdAndDelete(id);
		await cloudinary.uploader.destroy(deleteExam.questionImage.public_id);
		if (!deletedExam) {
			return res.status(404).json({
				error: true,
				message: "Exam not found",
			});
		}
		res.status(200).json({
			success: true,
			message: "Exam deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			error: true,
			message: "Failed to delete exam",
		});
	}
};
export const submitExam = async (req, res, next) => {
	try {
		const exam = await examModel.findById(req.params.id);
		if (!exam) {
			return res.status(404).json({ message: "Exam Not Found" });
		}

		const user = await userModel.findById(req.user._id);
		const submittedExam = user.submitedExams.find((examResult) => examResult.exam.toString() === exam._id.toString());
		if (submittedExam) {
			return res.status(403).json({ message: "You have already submitted this exam" });
		}

		// Add buffer time (10 minutes = 600 seconds)
		const bufferTime = 600000; // 10 minutes in seconds
		const actualDuration = exam.duration + bufferTime; // Add buffer to the original duration

		const currentTime = new Date();
		const timeElapsed = (currentTime - req.body.startedAt) / 60000; // timeElapsed in seconds

		if (timeElapsed > actualDuration) {
			return res.status(400).json({ message: "Exam time has expired" });
		}

		const { answers } = req.body;
		let score = 0;

		exam.question.forEach((question, index) => {
			if (question.answer === answers[index]) {
				score++;
			}
		});

		const totalQuestions = exam.question.length;
		const percentage = (score / totalQuestions) * 100;

		user.submitedExams.push({
			exam: exam._id,
			score,
			totalQuestions,
			percentage,
			startedAt: new Date(req.body.startedAt),
		});
		await user.save();

		res.json({ score, totalQuestions, percentage: percentage.toFixed(2) });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
export const getUserSubmitedExams = async (req, res) => {
	try {
		const user = await userModel.findById(req.user._id).populate("submitedExams.exam", "title");
		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}
		const examHistory = user.submitedExams.map((result) => ({
			exam: result.exam,
			score: result.score,
			totalQuestions: result.totalQuestions,
			percentage: result.percentage,
			takenAt: result.takenAt,
		}));
		res.json(examHistory);
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};
