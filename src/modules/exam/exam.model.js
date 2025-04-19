import mongoose from "mongoose";
const questionSchema = new mongoose.Schema({
    questionTitle: {
        type: String,
        required: true,
    },
    questionImage: {
        secure_url: {
            type: String,
        },
        public_id: {
            type: String,
        },
    },
    options: {
        A: {
            type: String,
            required: true,
        },
        B: {
            type: String,
            required: true,
        },
        C: {
            type: String,
            required: true,
        },
        D: {
            type: String,
            required: true,
        },
    },
    answer: {
        type: String,
        enum: ["A", "B", "C", "D"],
        required: true,
    },
});
const examSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        lessonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
            required: false,
        },
        question: [questionSchema],
        duration: {
            type: Number,
            required: true,
            default: 60,
            min: [1, "Exam duration should be atleast 1 mintue"],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
        timestamps: true,
    }
);
examSchema.virtual("Lessons", {
    ref: "Lesson",
    foreignField: "lessonId",
    localField: "_id",
});
examSchema.virtual("Courses", {
    ref: "Course",
    foreignField: "courseId",
    localField: "_id",
});
const examModel = mongoose.models.Exam || mongoose.model("Exam", examSchema);
export default examModel;
