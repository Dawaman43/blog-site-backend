import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
} from "../controllers/blog-controller.js";
import upload from "../middlewares/upload-middleware.js";

const router = express.Router();

router.post("/create", upload.array("images", 10), authMiddleware, createBlog);
router.delete("/:id", authMiddleware, deleteBlog);
router.get("/getAll", authMiddleware, getAllBlogs);
router.get("/:id", authMiddleware, getSingleBlog);
router.put("/:id", upload.array("images", 10), authMiddleware, updateBlog);

export default router;
