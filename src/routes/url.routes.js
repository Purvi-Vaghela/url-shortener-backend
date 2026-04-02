import express from "express";
const router = express.Router();
import { createShortUrl, getMyUrls, deleteUrl } from "../controllers/url.controller.js";
import authMiddleware from "../middleware/auth.js";

router.post("/shorten", authMiddleware, createShortUrl);
router.get("/my", authMiddleware, getMyUrls);
router.delete("/:id", authMiddleware, deleteUrl);

export default router;