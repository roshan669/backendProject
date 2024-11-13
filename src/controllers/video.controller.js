import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title) {
    throw new ApiError(400, "Title is required");
  }
  if (!description) {
    throw new ApiError(400, "description is required");
  }

  let videoLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.video) &&
    req.files.video.length > 0
  ) {
    videoLocalPath = req.files.video[0].path;
  }

  if (!videoLocalPath) {
    throw new ApiError(401, "Video file is required");
  }

  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.video.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }
  //   const thumbnailLocalPath = await req.files?.thumbnail[0]?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(401, "Thumbnail is required");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoUpload) {
    throw new ApiError(500, "Error while uploading video file on cloudinary");
  }

  if (!thumbnail) {
    throw new ApiError(
      500,
      "Error while uploading thumbnail file on cloudinary"
    );
  }

  const video = await Video.create({
    videoFile: videoUpload.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration: videoUpload.duration,
    owner: req.user._id,
  });

  const uploadedVideo = await Video.findById(video._id).select("-owner");

  if (!uploadedVideo) {
    throw new ApiError(500, "something went wrong while publishing video ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, uploadedVideo, "video publish successful"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video details found/fetched successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
