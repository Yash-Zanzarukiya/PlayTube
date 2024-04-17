import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) throw new APIError(400, "invalid videoId");

  const video = await Video.findById(videoId);
  if (!video) throw new APIError(400, "video not found");

  let isLiked = await Like.find({ video: videoId, likedBy: req.user._id });

  if (isLiked && isLiked.length > 0) {
    const like = await Like.findByIdAndDelete(isLiked[0]._id);
    isLiked = false;
  } else {
    const like = await Like.create({ video: videoId, likedBy: req.user._id });
    if (!like) throw new APIError(500, "error while toggling like");
    isLiked = true;
  }

  return res
    .status(200)
    .json(new APIResponse(200, { isLiked }, "like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) throw new APIError(400, "invalid commentId");
  const comment = await Comment.findById(commentId);
  if (!comment) throw new APIError(400, "no comment found");

  let isLiked = await Like.find({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (isLiked?.length > 0) {
    await Like.findByIdAndDelete(isLiked[0]._id);
    isLiked = false;
  } else {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    if (!like) throw new APIError(500, "error while toggling like");
    isLiked = true;
  }

  return res
    .status(200)
    .json(new APIResponse(200, { isLiked }, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) throw new APIError(400, "invalid tweetId");
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) throw new APIError(400, "no tweet found");

  let isLiked = await Like.find({ tweet: tweetId, likedBy: req.user._id });

  if (isLiked?.length > 0) {
    await Like.findByIdAndDelete(isLiked[0]._id);
    isLiked = false;
  } else {
    const like = await Like.create({ tweet: tweetId, likedBy: req.user._id });
    if (!like) throw new APIError(500, "error while toggling like");
    isLiked = true;
  }
  return res
    .status(200)
    .json(new APIResponse(200, { isLiked }, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const videos = await Like.aggregate([
    {
      $match: {
        video: { $ne: null },
        likedBy: req.user._id,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $match: {
              isPublished: true,
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
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: "$owner",
          },
          {
            $project: {
              _id: 1,
              videoFile: 1,
              title: 1,
              description: 1,
              duration: 1,
              thumbnail: 1,
              views: 1,
              owner: 1,
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(new APIResponse(200, videos, "videos sent successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
