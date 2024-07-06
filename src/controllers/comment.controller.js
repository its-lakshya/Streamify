import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiResponse(404, "Video not found");
  }

  const comments = await Video.aggregate([
    {
      $match: {
        _id: video._id,
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    // {
    //     $addFields: {
    //         comments: {
    //             $size: "$comments",
    //         }
    //     }
    // },
    {
      $project: {
        // title: 1,
        // thumbnail: 1,
        // videoFile: 1,
        // description: 1,
        // duration: 1,
        // isPublished: 1,
        comments: 1,
      },
    },
  ]);

  if (!comments?.length) {
    throw new apiError(404, "No comments found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, comments[0], "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;
  const content = req.body?.content;

  if (!videoId) {
    throw new apiError(404, "No video found to add comment");
  }

  if (!content) {
    throw new apiError(404, "No comment found");
  }

  const video = await Video.findById(videoId);

  const comment = await Comment.create({
    content,
    video,
    owner: user,
  });

  const addedComment = await Comment.findById(comment._id);

  if (!addedComment) {
    throw new apiError(500, "Something went wrong while adding the comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Comment added successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if(!commentId){
    throw new apiError(404, "No such comment found")
  }

  const updatedComments = await Comment.findByIdAndDelete(commentId, {new: true})

  return res
    .status(200)
    .json(new apiResponse(200, updatedComments, "Comment deteleted successfully"));

});

const updateComment = asyncHandler(async (req, res) => {});

export { getVideoComments, addComment, deleteComment, updateComment };
