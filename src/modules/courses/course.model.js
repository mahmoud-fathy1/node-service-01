import mongoose from "mongoose";
import { parse } from "uuid";
const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        image: {
            secure_url: {
                type: String,
                required: true,
            },
            public_id: {
                type: String,
                required: true,
            },
        },
        price: {
            type: Number,
            required: true,
        },
        duration: {
            type: String,
            required: true,
        },
        classGrade: {
            type: String,
            enum: ["first grade", "second grade", "third grade"],
            required: true,
        },
        purchaseCodes: [
            {
                code: {
                    type: String,
                    sparse: true, // ensure uniqueness at the database level
                    index: true, // add an index to speed up queries
                },
                isUsed: {
                    type: Boolean,
                    default: false,
                },
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    default: null,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        isFree: {
            type: Boolean,
            default: false,
        },
        lessons: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lesson",
            },
        ],
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
        },
        enrolledStudents: [
            {
                student: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                completedQuizzes: {
                    type: [mongoose.Schema.Types.ObjectId],
                    ref: "Quiz",
                },
                hasCompletedExam: {
                    type: Boolean,
                    default: false,
                },
                courseCompletion: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);
const Course = mongoose.model("Course", courseSchema);
export default Course;
