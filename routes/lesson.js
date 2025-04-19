import {Router} from "express"
import * as LessonController from "../src/Modules/lessons/lesson.controller.js"
import { isAuth, roles } from "../src/middlewares/auth.js"
import { upload } from "../src/middlewares/videoUploads.js"

const router = Router({mergeParams:true})


router.post("/",isAuth([roles.Admin]), upload.single('video'), LessonController.createLesson);
router.put("/:id",isAuth([roles.Admin]), upload.single('video'), LessonController.updateLesson);
router.delete("/:id",isAuth([roles.Admin]), LessonController.deleteLesson);
router.get("/all",isAuth([roles.Admin , roles.User]), LessonController.listLessons);
router.get("/allById/:id",isAuth([roles.Admin , roles.User]), LessonController.getbyId);


export default router
