import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle-sub/:channelId").post(toggleSubscription);
router.route("/sub-list-c/:channelId").get(getUserChannelSubscribers);
router.route("/subscribed-list/:subscriberId").get(getSubscribedChannels);

export default router;
