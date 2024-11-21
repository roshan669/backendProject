import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "ChannelId is required");
  }

  const totalVideos = await Video.countDocuments({ owner: channelId });
  const totalSubs = await Subscription.countDocuments({ channel: channelId });

  const totalVideoResult = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
        videoIds: {
          $push: "$_id",
        },
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "videoIds",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        totalLikes: {
          $size: "$likes",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalLikes: 1,
        totalViews: 1,
      },
    },
  ]);

  const totalVideoViews =
    totalVideoResult.length > 0 ? totalVideoResult[0].totalViews : 0;
  const totalLikes =
    totalVideoResult.length > 0 ? totalVideoResult[0].totalLikes : 0;

  const response = {
    totalVideos,
    totalLikes,
    totalSubs,
    totalVideoViews,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Channel stats fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel

  const { channelId } = req.params;
  const video = await Video.find({ owner: channelId });

  if (!video || video.length === 0) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
