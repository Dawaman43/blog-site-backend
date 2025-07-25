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
router
  .route("/:blogId/comment")
  .get(blogMiddleware, getComments)
  .post(authMiddleware, blogMiddleware, createComment);

router
  .route("/:blogId/comment/:commentId")
  .get(blogMiddleware, getComment)
  .put(authMiddleware, blogMiddleware, updateComment)
  .delete(authMiddleware, blogMiddleware, deleteComment);

export default router;
