import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

const router = Router();
router.route("/c-videos/:channelId").get(getChannelVideos);
router.route("/c-stats/:channelId").get(getChannelStats);

export default router;
