import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateUser,
} from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/get", authMiddleware, getCurrentUser);
router.patch("/update", authMiddleware, updateUser);

export default router;
