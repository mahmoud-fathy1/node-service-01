import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import lessonModel from "./lesson.model.js";
import { count, log } from "console";
import courseModel from "../courses/course.model.js";
import Mongoose from 'mongoose';
import Course from '../courses/course.model.js';


const generateShortID = () => {
  return crypto.randomBytes(3).toString("hex").slice(0, 6);
};



export const createLesson = async (req, res) => {
  try {
    const {
      courseId,
      lessonName,
      sheetsUrl,
      teacher
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(400).json({
        error: true,
        message: "Invalid Course ID"
      });
    }

    // Handle video upload if a file was provided
    let videoUrl = [];
    if (req.file) {
      try {
        const uploadResult = await uploadVideoToDummy(req.file.path);
        videoUrl.push({
          title: req.body.videoTitle || req.file.originalname,
          URL: uploadResult.fileUrl,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size
        });
      } catch (uploadError) {
        return res.status(500).json({
          error: true,
          message: "Video upload failed",
          details: uploadError.message
        });
      }
    }

    const newLesson = new lessonModel({
      lessonName,
      createdBy: req.user.id,
      courseId,
      teacher,
      videoUrl,
      sheetsUrl
    });

    await newLesson.save();

    return res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson: newLesson
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Unable to create lesson",
      details: error.message
    });
  }
};

export const listLessons = async (req, res) => {
  try {
    const {
      classGrade,
      search,
      courseId
    } = req.query;
    let filter = {};
    if (classGrade) {
      filter.classGrade = classGrade;
    }
    if (courseId) {
      filter.courseId = courseId;
    }
    if (search) {
      filter.lessonName = {
        $regex: search,
        $options: "i"
      };
    }
    const lessons = await lessonModel.find(filter).select("-__v").sort({
      createdAt: -1
    });
    res.status(200).json({
      success: true,
      message: "Lessons fetched successfully",
      lessons: lessons
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch lessons",
      error
    });
  }
};
export const getbyId = async (req, res) => {
  const {
    id
  } = req.params;
  if (!Mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: true,
      message: "Invalid lesson ID"
    });
  }
  try {
    const lesson = await lessonModel.findById(id);
    if (!lesson) {
      return res.status(404).json({
        error: true,
        message: "Lesson not found"
      });
    }
    res.status(200).json({
      success: true,
      lesson
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch lesson",
      error
    });
  }
};
export const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const {
      courseId,
      lessonName,
      videoUrl,
      sheetsUrl,
      teacher
    } = req.body;
    const updatedLesson = await lessonModel.findByIdAndUpdate(lessonId, req.body, {
      new: true
    });
    if (!updatedLesson) {
      return res.status(404).json({
        message: "Lesson not found"
      });
    }
    res.status(200).json({
      message: "Lesson updated successfully",
      lesson: updatedLesson
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update lesson",
      error: error.message
    });
  }
};
export const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const deletedLesson = await lessonModel.findByIdAndDelete(lessonId);
    if (!deletedLesson) {
      return res.status(404).json({
        message: "Lesson not found",
        error
      });
    }
    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
      lesson: deletedLesson
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete lesson",
      error
    });
  }
};