import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Convert to numbers for pagination
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // Build the filter object
  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" }; // Case-insensitive search
  }
  if (userId) {
    filter.owner = userId;
  }

  // Build the sorting object
  const sort = {};
  if (sortBy && sortType) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  }

  // Fetch videos from database with pagination and sorting
  const videos = await Video.find(filter)
    .sort(sort)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  // Get the total count for pagination
  const totalVideos = await Video.countDocuments(filter);

  // Prepare the response with pagination info
  const response = {
    data: videos,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalVideos / limitNumber),
    totalVideos,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Videos fetched successfully"));
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

// for logged in Users
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { watchHistory: videoId } }, // Avoid duplicates
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, video, "Video details found/fetched successfully")
    );
});

// for Not logged in users
const getVideoByIdNoAuth = asyncHandler(async (req, res) => {
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
  // const video = await Video.findById(videoId);

  // if (!video) {
  //   throw new ApiError(400, "Video doens't exist");
  // }

  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;
  console.log(thumbnailLocalPath);

  if (!(title || description || thumbnailLocalPath)) {
    throw new ApiError(400, "All fields are required");
  }

  if (thumbnailLocalPath) {
    var thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnailUpload) {
      throw new ApiError(500, "Error while uploading file to cloudinary");
    }
  }

  const update = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnailUpload,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, update, "Video details updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  const video = await Video.findByIdAndDelete(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Find video by ID and populate owner
  const verifyOwner = await Video.findById(videoId).populate("owner");

  if (!verifyOwner) {
    throw new ApiError(404, "video not found");
  }

  // Check if the requester is the owner
  if (!verifyOwner.owner._id.equals(req.user._id)) {
    throw new ApiError(401, "unauthorized request");
  }

  // or

  // if (!(verifyOwner.owner._id.toString() === req.user._id.toString())) {
  //   throw new ApiError(401, "unauthorized request");
  // }

  // Toggle the publish status
  const toggle = await Video.findByIdAndUpdate(
    videoId,
    [{ $set: { isPublished: { $not: "$isPublished" } } }],
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, toggle, "Toggling publish status successful"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
