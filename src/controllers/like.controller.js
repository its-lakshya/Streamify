import mongoose, { mongo } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;

  if(!user){
    throw new apiError(404, "Login to your account to like videos");
  }

  if(!mongoose.isValidObjectId(videoId)){
    throw new apiError(404, "Invalid videoId");
  }

  const video = await Video.findById(videoId)

  if(!video){
    throw new apiError(404, "Video not found")
  }

  const existingLiked = await Like.findOne({video: video, likedBy: user})

  if(existingLiked){
    await Like.findByIdAndDelete(existingLiked._id);
    return res
      .status(200)
      .json(new apiResponse(200, "Video disliked"));
  }
  else{
    const liked = await Like.create({
      video: video,
      likedBy: user
    })

    const likedVideo = await Like.findById(liked._id);

    if(!likedVideo){
      throw new apiError(500, "Something went wrong when liking the video")
    }
  
    return res
      .status(200)
      .json(new apiResponse(200, "Video liked"));
  }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
  

})

const toggleTweetLike = asyncHandler(async (req, res) => {

})

const getLikedVideos = asyncHandler(async (req, res) => {

})

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos
}