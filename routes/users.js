import express from "express";
import { cleanBody } from "../src/middlewares/cleanbody.js";
import validateToken from "../src/middlewares/validateToken.js";
import * as AuthController from "../src/modules/users/user.controller.js";
import * as validators from "../src/modules/users/user.validators.js";
import { Joivalidation } from "../src/middlewares/JoiValidation.js";
import * as Password from "../src/modules/users/password.js";
import { isAuth, roles } from "./../src/middlewares/auth.js";

const router = express.Router();

//* Register a new user
router.post("/signup", cleanBody, Joivalidation(validators.signup), AuthController.signup);

//* Login existing user
router.post("/login", cleanBody, Joivalidation(validators.login), AuthController.login);

router.post("/forget", Password.forgetPassword);
router.post("/reset/:token", Password.ResetPassword);

//* Get all users (admin only)
router.get("/", isAuth([roles.Admin]), AuthController.getAllUsers);

//* Get user by ID including purchasedCourses (admin only)
router.get("/:id", isAuth([roles.Admin, roles.User]), AuthController.getUserById);

//* Update user by ID (admin only)
router.put("/:id", isAuth([roles.Admin]), AuthController.updateUserById);

//* Delete user by ID (admin only)
router.delete("/:id", isAuth([roles.Admin]), AuthController.deleteUser);

export default router;
