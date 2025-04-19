import express from "express";
import {
    createCourse,
    updateCourse,
    deleteCourse,
    getAllCourses,
    getCourseById,
    purchaseCourse,
    createPurchaseCode,
    purchaseCourseByCode,
} from "../src/Modules/courses/course.controller.js";
import { isAuth, roles } from "../src/middlewares/auth.js";
import { multerCloudFunction } from "../src/utils/multer.js";
import { allowedExtensions } from "../src/utils/allowedExtensions.js";

const router = express.Router();

//* Create a new course (admin only)
router.post("/create", isAuth([roles.Admin]), multerCloudFunction(allowedExtensions.image).single("image"), createCourse);

//* Update a course by ID (admin only)
router.put("/:id", isAuth([roles.Admin]), multerCloudFunction(allowedExtensions.image).single("image"), updateCourse);

//* Delete a course by ID (admin only)
router.delete("/:id", isAuth([roles.Admin]), deleteCourse);

//* Get all courses (accessible to all everyone)
router.get("/", getAllCourses);

//* Get Course by ID and it's enrolled students (accessible to all authenticated users)
router.get("/:id", isAuth([roles.Admin, roles.User]), getCourseById);

//* Purchase a course via fawaterk (user only)
router.post("/purchase-course", isAuth([roles.User]), purchaseCourse);

//* Route to create a purchase code for a specific course
router.post("/create-purchase-code", isAuth([roles.Admin]), createPurchaseCode);

//* Route to purchase a course by code
router.post("/purchaseByCode", isAuth([roles.User]), purchaseCourseByCode);

export default router;
