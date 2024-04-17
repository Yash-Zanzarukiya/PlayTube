import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) throw new APIError(400, "Invalid ChannelId");

  let isSubscribed;

  const findRes = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (findRes) {
    const res = await Subscription.deleteOne({
      subscriber: req.user._id,
      channel: channelId,
    });
    isSubscribed = false;
  } else {
    const newSub = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    if (!newSub) throw new APIError(500, "Failed to toggle Subscription");
    isSubscribed = true;
  }

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        { isSubscribed },
        "Subscription toggled successfully"
      )
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) throw new APIError(400, "Invalid ChannelId");

  const subscriberList = await Subscription.aggregate([
    {
      $match: { channel: new mongoose.Types.ObjectId(channelId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscriber",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new APIResponse(200, subscriberList, "Subscriber Sent Successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId))
    throw new APIError(400, "Invalid subscriberId");

  const subscribedChannels = await Subscription.aggregate([
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
        as: "channel",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$channel",
    },
    {
      $project: {
        channel: 1,
      },
    },
  ]);

  subscribedChannels.subscribedTOCount = subscribedChannels.length;

  return res
    .status(200)
    .json(
      new APIResponse(
        200,
        {subscribedChannels },
        "Subscribed channel list sent successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
