import mongoose from "mongoose";
import pkg from "mongoose";
const { model, Schema, Types } = pkg;
const submitedExamSchema = new Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    takenAt: {
        type: Date,
        default: Date.now,
    },
    startedAt: {
        type: Date,
        required: true,
    },
});
const userSchema = new Schema(
    {
        fName: {
            type: String,
            required: [true, "firstName is required"],
            min: [2, "min length 2 char"],
            max: [20, "max length 20 char"],
        },
        lName: {
            type: String,
            required: [true, "lastName is required"],
            min: [2, "min length 2 char"],
            max: [20, "max length 20 char"],
        },
        phoneNumber: {
            type: String,
            unique: true,
            required: true,
        },
        parentPhoneNumber: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        classGrade: {
            type: String,
            enum: ["first grade", "second grade", "third grade"],
            required: true,
        },
        role: {
            type: String,
            default: "User",
            enum: ["Admin", "User"],
        },
        forgetPass: String,
        purchasedCourses: [
            {
                course: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Course",
                },
                purchaseDate: {
                    type: Date,
                    default: Date.now,
                },
                purchaseCode: {
                    type: String,
                },
                payments: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Payment",
                    },
                ],
            },
    ],
        
        submitedExams: [submitedExamSchema],
    },
    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },
    }
);
userSchema.virtual("Exams", {
    ref: "Exam",
    foreignField: "examId",
    localField: "_id",
});
const userModel = mongoose.models.User || model("User", userSchema);
export default userModel;
