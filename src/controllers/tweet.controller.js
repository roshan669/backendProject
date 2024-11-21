import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const user = req.user._id;

  if (!user) {
    throw new ApiError(401, "unauthorized request");
  }

  const tweet = await Tweet.create({
    content,
    owner: user,
  });

  if (!tweet) {
    throw new ApiError(500, "something went wrong while creating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Creating tweet successfull"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "UserId is required");
  }

  const tweets = await Tweet.find({ owner: userId }).select("-owner");

  if (!tweets) {
    throw new ApiError(404, "No tweets found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }

  const verifyOwner = await Tweet.findById(tweetId).populate("owner");

  if (!verifyOwner.owner._id.equals(req.user._id)) {
    throw new ApiError(401, "Unauthorized request");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    [
      {
        $set: {
          content: content,
        },
      },
    ],
    {
      new: true,
    }
  ).select("-owner");

  if (!updatedTweet) {
    throw new ApiError(500, "something went wrong while updating tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Updating tweet successfull"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }

  const verifyOwner = await Tweet.findById(tweetId).populate("owner");
  if (!verifyOwner) {
    throw new ApiError(404, "tweet not found");
  }

  if (!verifyOwner.owner._id.equals(req.user._id)) {
    throw new ApiError(401, "Unauthorized request");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(500, "something went wrong while deleting tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleteTweet, "deleting tweet successfull"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
