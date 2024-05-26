import { Tweet } from "../models/tweet.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { tweet } = req.body;

  if (!tweet) throw new APIError(400, "Tweet content required");

  const tweetRes = await Tweet.create({ content: tweet, owner: req.user._id });

  if (!tweetRes) throw new APIError(500, "Error occured while creating tweet");

  return res
    .status(200)
    .json(new APIResponse(200, tweetRes, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) throw new APIError(400, "Invalid userId");

  const allTweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
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
              avatar: 1,
              fullName: 1,
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
        content: 1,
        createdAt: 1,
        updatedAt: 1,
        owner: 1,
        totalLikes: {
          $size: "$likes",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user?._id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new APIResponse(200, allTweets, "all tweets send successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { tweet } = req.body;
  if (!isValidObjectId(tweetId)) throw new APIError(400, "Invalid tweetId");
  if (!tweet) throw new APIError(400, "tweet content required");

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: tweet,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new APIResponse(200, updatedTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) throw new APIError(400, "Invalid tweetId");

  const findRes = await Tweet.findByIdAndDelete(tweetId);

  if (!findRes) throw new APIError(500, "tweet not found");

  return res
    .status(200)
    .json(
      new APIResponse(200, { isDeleted: true }, "tweet deleted successfully")
    );
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
