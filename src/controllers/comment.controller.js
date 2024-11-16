import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const filter = {};

  filter.video = videoId;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const comment = await Comment.find(filter)
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalComment = await Comment.countDocuments(filter);
  const totalPages = Math.ceil(totalComment / limitNumber);

  const response = {
    data: comment,
    totalPages,
    currentPage: pageNumber,
    totalComment,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Vidoe Comment fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { userComment } = req.body;

  if (!userComment) {
    throw new ApiError(400, "Comment is Required");
  }

  if (!videoId) {
    throw new ApiError(400, "videoId is Required");
  }

  //   const video = new mongoose.ObjectId(videoId);

  const user = (req.user?._id).toString();

  if (!user) {
    throw new ApiError(400, "Unauthorized access");
  }

  const comment = await Comment.create({
    content: userComment,
    video: videoId,
    owner: user,
  });

  if (!comment) {
    throw new ApiError(500, "error while adding comment to db");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;

  const { userComment } = req.body;
  console.log(userComment);

  const verifyOwner = await Comment.findById(commentId).populate("owner");

  if (!verifyOwner) {
    throw new ApiError(404, "Comment not found");
  }

  if (!verifyOwner.owner._id.equals(req.user._id)) {
    throw new ApiError(401, "Unuathorized request ");
  }

  const comment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: userComment,
      },
    },
    {
      new: true,
    }
  );

  if (!comment) {
    throw new ApiError(500, "error while updating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  const verifyOwner = await Comment.findById(commentId).populate("owner");

  if (!verifyOwner) {
    throw new ApiError(404, "comment not found");
  }

  if (!verifyOwner.owner._id.equals(req.user._id)) {
    throw new ApiError(404, "Unauthorized request");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
