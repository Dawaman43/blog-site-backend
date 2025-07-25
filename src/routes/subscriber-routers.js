import express from "express";
import {
  subscribe,
  unsubscribe,
  unsubscribeGet,
} from "../controllers/subscriber-controller.js";

const router = express.Router();

router.post("/subscribe", subscribe);
router.delete("/unsubscribe", unsubscribe);
router.get("/unsubscribe", unsubscribeGet);

export default router;
