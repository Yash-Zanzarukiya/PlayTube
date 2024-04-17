import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

// http://localhost:3000/api/v1/comment/...

router.route("/get/:videoId").get(getVideoComments);
router.route("/add/:videoId").post(addComment);
router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;
