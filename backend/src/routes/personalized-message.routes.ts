// src/routes/personalized-message.routes.ts
import { Router } from "express";
import { personalizedMessageController } from "../controllers/personalized-message.controller";

const router = Router();

/**
 * @route POST /personalized-message
 * @desc Create a new personalized message
 */
router.post("/", personalizedMessageController.createMessage);

export default router;
