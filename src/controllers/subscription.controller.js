import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }

  const existingSubscriber = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscriber) {
    await Subscription.findOneAndDelete(existingSubscriber._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          existingSubscriber,
          "Channel Unsubscription Successfull"
        )
      );
  }

  const subscribe = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (!subscribe) {
    throw new ApiError(500, "Error while saving it to database");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subscribe, "Channel subscription successfull"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(400, "channelId required");
  }

  const channels = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
  ]);
  if (!channels || channels.length === 0) {
    throw new ApiError(404, "No subscriptions found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, channels, "User Channel List fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "subscriberId required");
  }

  const SubscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channels",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!SubscribedChannels || SubscribedChannels.length === 0) {
    throw new ApiError(404, "NO subscription found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        SubscribedChannels,
        "Subscribed Channel List fetched Successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
