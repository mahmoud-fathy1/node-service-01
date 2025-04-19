import Joi from "joi";
import { generalFields } from "../../middlewares/JoiValidation.js";
export const signup = Joi.object({
  fName: Joi.string().min(3).max(10).required(),
  lName: Joi.string().min(3).max(10).required(),
  email: generalFields.email,
  password: generalFields.password,
  phoneNumber: Joi.string().required(),
  parentPhoneNumber: Joi.string().required(),
  classGrade: Joi.string().valid("first grade", "second grade", "third grade").required()
}).required();
export const login = Joi.object({
  phoneNumber: Joi.string().required(),
  password: generalFields.password
}).required();