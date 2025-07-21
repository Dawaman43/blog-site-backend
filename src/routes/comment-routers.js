import express from "express";
import {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
} from "../controllers/comment-controller.js";

import { blogMiddleware } from "../middlewares/blog-middleware.js";
import { authMiddleware } from "./../middlewares/auth-middleware.js";

const router = express.Router({ mergeParams: true });

router.use("/:blogId/comment", blogMiddleware);
router
  .route("/:blogId/comment")
  .get(getComments)
  .post(authMiddleware, createComment);

router
  .route("/:blogId/comment/:commentId")
  .get(getComment)
  .put(authMiddleware, updateComment)
  .delete(authMiddleware, deleteComment);

export default router;
