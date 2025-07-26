import express from "express";
import {
  createComment,
  getComments,
  getComment,
  updateComment,
  deleteComment,
  likeComment,
} from "../controllers/comment-controller.js";
import { blogMiddleware } from "../middlewares/blog-middleware.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { adminMiddleware } from "../middlewares/admin-middleware.js";
import {
  createBlog,
  getBlogBySlug,
  incrementViewCount,
  getAllBlogs,
  getBlogCategories,
} from "../controllers/blog-controller.js";

const router = express.Router({ mergeParams: true });

// Middleware for routes involving blogId
router.use("/:blogId/comment", blogMiddleware);

// Routes for listing and creating comments
router
  .route("/:blogId/comment")
  .get(getComments)
  .post(authMiddleware, createComment);

// Routes for specific comment actions
router
  .route("/:blogId/comment/:commentId")
  .get(getComment)
  .put(authMiddleware, updateComment)
  .delete(authMiddleware, deleteComment);

// Route for liking a comment
router.post("/create", authMiddleware, adminMiddleware,createBlog);
router.post("/:blogId/comment/:commentId/like", authMiddleware, likeComment);

// Blog routes
router.get("/slug/:slug", getBlogBySlug);
router.patch("/:id/view", blogMiddleware, incrementViewCount);
router.get("/getAll", getAllBlogs); // Added route for getAllBlogs
router.get("/categories", getBlogCategories); // Added route for getBlogCategories

export default router;
