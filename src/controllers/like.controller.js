import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!videoId) {
    throw new ApiError(400, "No videoId");
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user?.id,
  });

  if (!like) {
    throw new ApiError(500, "error while  liking");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  if (!commentId) {
    throw new ApiError(400, "No videoId");
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user?.id,
  });

  if (!like) {
    throw new ApiError(500, "error while  liking");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  if (!tweetId) {
    throw new ApiError(400, "No videoId");
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user?.id,
  });

  if (!like) {
    throw new ApiError(500, "error while  liking");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, like, "Comment liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = req.user._id;
  const likes = await Like.find({ likedBy: user }).populate("video");
  if (!likes || likes.length === 0) {
    throw new ApiError(404, "No likes found");
  }

  const videos = likes.map((like) => like.video);
  if (!videos) {
    throw new ApiError(404, "No videos found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
