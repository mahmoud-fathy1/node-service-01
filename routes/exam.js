import { Router } from "express";
import * as examController from "../src/Modules/exam/exam.controller.js";
import validateToken from "../src/middlewares/validateToken.js";
import { isAuth, roles } from "../src/middlewares/auth.js";
import { multerCloudFunction } from "../src/utils/multer.js";
import { allowedExtensions } from "../src/utils/allowedExtensions.js";

const router = Router({ mergeParams: true });

// Create a new exam
router.post("/create", isAuth([roles.Admin]), multerCloudFunction(allowedExtensions.image).any(), examController.createExam);

// Get all exams
router.get("/all", isAuth([roles.Admin, roles.User]), examController.getExams);

// Get a specific exam by ID
router.get("/:id", isAuth([roles.Admin, roles.User]), examController.getExamById);

// Update an exam
router.put(
    "/update/:id",
    isAuth([roles.Admin]),
    multerCloudFunction(allowedExtensions.image).array("image", 20),
    examController.updateExam
);

// Delete an exam
router.delete("/delete/:id", isAuth([roles.Admin]), examController.deleteExam);

//Submit Exam
router.post("/:id/submit", isAuth([roles.Admin, roles.User]), examController.submitExam);

// Get user's exam history
router.get("/user/submited", isAuth([roles.Admin, roles.User]), examController.getUserSubmitedExams);

export default router;
