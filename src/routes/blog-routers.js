import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  getBlogBySlug,
} from "../controllers/blog-controller.js";
import upload from "../middlewares/upload-middleware.js";

const router = express.Router();

router.post("/create", authMiddleware, upload.array("images", 10), createBlog);
router.delete("/:id", authMiddleware, deleteBlog);
router.get("/getAll", getAllBlogs);
router.get("/:id", getSingleBlog);
router.put("/:id", authMiddleware, upload.array("images", 10), updateBlog);
router.get("/slug/:slug", getBlogBySlug);

export default router;
