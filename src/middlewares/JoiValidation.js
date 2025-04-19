import Joi from "joi";
import Types from "mongoose";
const validateObjectId = (value, helper) => {

  return Types.ObjectId.isValid(value) ? true : helper.message("In-valid objectId");
};

export const generalFields = {
  email: Joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 4,
    tlds: {
      allow: ["com", "net"]
    }
  }).required(),
  password: Joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
  id: Joi.string().custom(validateObjectId).required(),
  file: Joi.object({
    size: Joi.number().positive().required(),
    path: Joi.string().required(),
    filename: Joi.string().required(),
    destination: Joi.string().required(),
    mimetype: Joi.string().required(),
    encoding: Joi.string().required(),
    originalname: Joi.string().required(),
    fieldname: Joi.string().required()
  })
};
export const Joivalidation = schema => {
  return (req, res, next) => {
    const inputsData = {
      ...req.body,
      ...req.query,
      ...req.params
    };
    if (req.file || req.files) {
      inputsData.file = req.file || req.files;
    }
    const validateData = schema.validate(inputsData, {
      abortEarly: false
    });
    if (validateData.error) {
      return res.status(400).json({
        message: "Validation Error",
        validationErr: validateData.error.details
      });
    } else {
      return next();
    }
  };
};