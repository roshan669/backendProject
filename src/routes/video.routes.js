import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  deleteVideo,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/publish-vid").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router.route("/get-vid/:videoId").get(verifyJWT, getVideoById);
router
  .route("/updatevideo/:videoId")
  .patch(upload.single("thumbnail"), updateVideo);

router.route("/delete-vid/:videoId").delete(deleteVideo);
router.route("/toggle/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;
