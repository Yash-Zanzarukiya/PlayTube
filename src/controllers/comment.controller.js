import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) throw new APIError(400, "Invalid VideoId");

  const options = {
    page,
    limit,
  };

  const video = await Video.findById(videoId);

  // const allComment = await Comment.aggregate([
  //   {
  //     $match: {
  //       video: new mongoose.Types.ObjectId(videoId),
  //     },
  //   },
  //   {
  //     $sort: {
  //       createdAt: -1,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "likes",
  //       localField: "_id",
  //       foreignField: "comment",
  //       as: "likes",
  //       pipeline: [
  //         {
  //           $project: {
  //             comment: 1,
  //             likedBy: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "owner",
  //       foreignField: "_id",
  //       as: "owner",
  //       pipeline: [
  //         {
  //           $project: {
  //             fullName: 1,
  //             username: 1,
  //             avatar: 1,
  //             _id: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   { $unwind: "$owner" },
  //   {
  //     $addFields: {
  //       likesCount: {
  //         $size: "$likes",
  //       },
  //       isLiked: {
  //         $cond: {
  //           if: { $in: [req.user?._id, "$likes.likedBy"] },
  //           then: true,
  //           else: false,
  //         },
  //       },
  //       isLikedByVideoOwner: {
  //         $cond: {
  //           if: { $in: [video.owner, "$likes.likedBy"] },
  //           then: true,
  //           else: false,
  //         },
  //       },
  //       isOwner: {
  //         $eq: [req.user?._id, "$owner._id"],
  //       },
  //     },
  //   },
  //   {
  //     $project: {
  //       content: 1,
  //       owner: 1,
  //       createdAt: 1,
  //       updatedAt: 1,
  //       likesCount: 1,
  //       isLiked: 1,
  //       isLikedByVideoOwner: 1,
  //       isOwner: 1,
  //     },
  //   },
  // ]);

  const allComment = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    // sort by date
    {
      $sort: {
        createdAt: -1,
      },
    },
    // get comments all likes and dislikes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likes",
      },
    },
    // fetch owner details
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
              username: 1,
              avatar: 1,
              _id: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$owner" },
    // logic to derive fields from like array
    {
      $addFields: {
        likesCount: {
          $size: {
            $filter: {
              input: "$likes",
              as: "like",
              cond: { $eq: ["$$like.liked", true] },
            },
          },
        },
        disLikesCount: {
          $size: {
            $filter: {
              input: "$likes",
              as: "like",
              cond: {
                $eq: ["$$like.liked", false],
              },
            },
          },
        },
        isLiked: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$likes",
                      as: "like",
                      cond: {
                        $and: [
                          {
                            $eq: ["$$like.likedBy", req.user?._id],
                          },
                          {
                            $eq: ["$$like.liked", true],
                          },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
            then: true,
            else: false,
          },
        },
        isDisLiked: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$likes",
                      as: "like",
                      cond: {
                        $and: [
                          {
                            $eq: ["$$like.likedBy", req.user?._id],
                          },
                          {
                            $eq: ["$$like.liked", false],
                          },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
            then: true,
            else: false,
          },
        },
        isLikedByVideoOwner: {
          $cond: {
            if: {
              $in: [video.owner, "$likes.likedBy"],
            },
            then: true,
            else: false,
          },
        },
        isOwner: {
          $eq: [req.user?._id, "$owner._id"],
        },
      },
    },
    {
      $project: {
        content: 1,
        owner: 1,
        createdAt: 1,
        updatedAt: 1,
        isLiked: 1,
        likesCount: 1,
        isLikedByVideoOwner: 1,
        isOwner: 1,
        isDisLiked: 1,
        disLikesCount: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new APIResponse(200, allComment, "All comments Sent"));

  Comment.aggregatePaginate(allComment, options, function (err, results) {
    console.log("results", results);
    if (!err) {
      const {
        docs,
        totalDocs,
        limit,
        page,
        totalPages,
        pagingCounter,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      } = results;

      return res.status(200).json(
        new APIResponse(
          200,
          {
            Comments: docs,
            totalDocs,
            limit,
            page,
            totalPages,
            pagingCounter,
            hasPrevPage,
            hasNextPage,
            prevPage,
            nextPage,
          },
          "Comments fetched successfully"
        )
      );
    } else throw new APIError(500, err.message);
  });
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!isValidObjectId(videoId)) throw new APIError(400, "Invalid VideoId");
  if (!content) throw new APIError(400, "No Comment Found");

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });
  if (!comment) throw new APIError(500, "Error while adding comment");

  const { username, avatar, fullName, _id } = req.user;

  const commentData = {
    ...comment._doc,
    owner: { username, avatar, fullName, _id },
    likesCount: 0,
    isOwner: true,
  };

  return res
    .status(200)
    .json(new APIResponse(200, commentData, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(commentId)) throw new APIError(400, "Invalid VideoId");
  if (!content) throw new APIError(400, "No Comment Found");
  const newComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );
  if (!newComment) throw new APIError(500, "Error while editing comment");
  return res
    .status(200)
    .json(new APIResponse(200, newComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) throw new APIError(400, "Invalid VideoId");

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) throw new APIError(500, "Error while deleting comment");

  const deleteLikes = await Like.deleteMany({
    comment: new mongoose.Types.ObjectId(commentId),
  });

  return res
    .status(200)
    .json(
      new APIResponse(200, { isDeleted: true }, "Comment deleted successfully")
    );
});

export { getVideoComments, addComment, updateComment, deleteComment };
