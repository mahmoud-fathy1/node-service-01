import mongoose from "mongoose";


const videoschema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  URL: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
});

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lessonName: {
    type: String,
    required: true
  },
  videoUrl: [videoschema],
  sheetsUrl: [{
    title: {
      type: String,
      required: true
    },
    URL: {
      type: String,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: {
    createdAt: "createdAt",
    updatedAt: "updatedAt"
  }
});
const lessonModel = mongoose.models.Lesson || mongoose.model("Lesson", lessonSchema);
export default lessonModel;