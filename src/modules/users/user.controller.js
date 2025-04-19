import dotenv from "dotenv";
dotenv.config();
import { v4 as uuid } from "uuid";
import userModel from "./user.model.js";
import { signup as userSchema } from "./user.validators.js";
import mongoose from "mongoose";
import { generateToken } from "../../utils/GenerateAndVerifyToken.js";
import { compare } from "bcrypt";
export const signup = async (req, res, next) => {
  try {
    const result = userSchema.validate(req.body);
    if (result.error) {
      return res.status(400).json({
        error: true,
        message: result.error.message
      });
    }
    const {
      fName,
      lName,
      phoneNumber,
      parentPhoneNumber,
      email,
      password,
      classGrade
    } = req.body;
    if (await userModel.findOne({
      email
    })) {
      return next(new Error("Email is already in use", {
        cause: 409
      }));
    }
    const hashedPassword = await hash({
      plaintext: password
    });
    const newUser = await userModel.create({
      fName,
      lName,
      phoneNumber,
      parentPhoneNumber,
      email,
      password: hashedPassword,
      classGrade
    });
    const token = generateToken({
      payload: {
        id: newUser._id,
        role: newUser.role
      }
    });
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Unable to register user",
      details: error.message
    });
  }
};
export const login = async (req, res, next) => {
  try {
    const {
      phoneNumber,
      password
    } = req.body;
    const user = await userModel.findOne({
      phoneNumber
    });
    if (!user) {
      return res.status(404).json({
        message: "User not registered"
      });
    }
    const isPasswordValid = compare({
      plaintext: password,
      hashValue: user.password
    });
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid login credentials"
      });
    }
    const access_token = generateToken({
      payload: {
        id: user._id,
        role: user.role
      }
    });
    return res.status(200).json({
      message: "Login successful",
      access_token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Unable to login",
      details: error.message
    });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("fName lName phoneNumber email role classGrade createdAt updatedAt");
    res.status(200).json({
      message: "Users retrieved successfully",
      users
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message
    });
  }
};
export const getUserById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const user = await userModel.findById(id).populate("purchasedCourses.course").select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.status(200).json({
      message: "User details retrieved successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: error.message
    });
  }
};
export const updateUserById = async (req, res) => {
  const {
    id
  } = req.params;
  const updates = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID"
      });
    }
    const user = await userModel.findById(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    Object.keys(updates).forEach(key => {
      if (user[key] !== undefined) {
        user[key] = updates[key];
      }
    });
    await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update user",
      error: error.message
    });
  }
};
export const deleteUser = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    res.status(200).json({
      message: "User deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    });
  }
};