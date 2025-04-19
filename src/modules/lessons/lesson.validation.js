import Joi from "joi";
export const lessonSchema = Joi.object().keys({
  lessonName: Joi.string().required(),
  courseId: Joi.string().required(),
  classGradeId: Joi.string().required(),
  type: Joi.string().required(),
  videoUrl: Joi.array().items(Joi.object()).required(),
  sheetsUrl: Joi.array().items(Joi.string()).required()
});