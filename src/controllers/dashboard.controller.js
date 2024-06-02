import { APIResponse } from "../utils/APIResponse.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelStats = {};

  const videoStates = await Video.aggregate([
    {
      $match: {
        owner: req.user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
        totalVideos: { $count: {} },
      },
    },
  ]);

  const subscriber = await Subscription.aggregate([
    {
      $match: {
        channel: req.user._id,
      },
    },
    {
      $count: "totalSubscribers",
    },
  ]);

  const totalLikes = await Like.aggregate([
    {
      $match: {
        video: { $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "channelvideo",
        pipeline: [
          {
            $match: {
              owner: req.user._id,
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channelvideo: {
          $first: "$channelvideo",
        },
      },
    },
    {
      $match: {
        channelvideo: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        likeCount: {
          $sum: 1,
        },
      },
    },
  ]);

  // TESTME : Not working throwing errors
  channelStats.ownerName = req.user.fullName;
  channelStats.totalViews = (videoStates && videoStates[0]?.totalViews) || 0;
  channelStats.totalVideos = (videoStates && videoStates[0]?.totalVideos) || 0;
  channelStats.totalSubscribers =
    (subscriber && subscriber[0]?.totalSubscribers) || 0;
  channelStats.totalLikes = (totalLikes && totalLikes[0]?.likeCount) || 0;

  return res
    .status(200)
    .json(
      new APIResponse(200, channelStats, "Channel states sent successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const allVideos = await Video.aggregate([
    {
      $match: {
        owner: req.user._id,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likesConunt",
        pipeline: [
          {
            $group: {
              _id: "video",
              likesConunt: { $sum: 1 },
            },
          }
        ],
      },
    },
    {
      $unwind: {
        path: "$likesConunt",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        likesConunt: {
          $ifNull: ["$likesConunt.likesConunt", 0],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
  ]);
  return res
    .status(200)
    .json(new APIResponse(200, allVideos, "All videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
