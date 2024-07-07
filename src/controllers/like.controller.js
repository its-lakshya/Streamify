import mongoose, { mongo } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { apiError } from "../utils/apiError.js"
import { apiResponse } from "../utils/apiresponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

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
  const { commentId } = req.params;
  const user = req.user;

  if(!user){
    throw new apiError(404, "Please login to like the comment");
  }

  if(!mongoose.isValidObjectId(commentId)){
    throw new apiError(404, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId)

  if(!comment){
    throw new apiError(404, "No comment found");
  }

  const existingLiked = await Like.findOne({comment: comment, likedBy: user})

  if(existingLiked){
    await Like.findByIdAndDelete(existingLiked._id);
    return res
      .status(200)
      .json(new apiResponse(200, "Comment disliked successfuly"))
  }
  else{
    const liked = new Like({comment: comment, likedBy: user})
    await liked.save();

    if(!liked){
      throw new apiError(500, "Something went while liking the comment")
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Comment liked successfuly"))
  }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const user = req.user;

  if(!user){
    throw new apiError(404, "Unauthorized request")
  }

  if(!mongoose.isValidObjectId(tweetId)){
    throw new apiError(404, "Invalid tweet id");
  }

  const tweet = await Tweet.findById(tweetId);

  const alreadyLiked = await Like.findOne({tweet, likedBy: user});

  if(alreadyLiked){
    const deleteLike = await Like.findByIdAndDelete(alreadyLiked._id);

    if(!deleteLike){
      throw new apiError(500, "Something went wrong while disliking the tweet")
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Tweet disliked successfuly"));
  }
  else{
    const like = await Like.create({
      tweet: tweet,
      likedBy: user
    })
  
    const likedTweet = await Like.findById(like._id);
  
    if(!likedTweet){
      throw new apiError(500, "Something went wrong while liking the tweet");
    }
  
    return res
      .status(200)
      .json(new apiResponse(200, "Tweet liked successfuly"));
  }

})

const getLikedVideos = asyncHandler(async (req, res) => {
  const user = req.user;

  const likedVideos = await Like.find({ likedBy: user, video: {$exists: true, $ne: null} })
  // const likedVideos = await Like.find({ likedBy: user, video: {$exists: true, $ne: null} }).populate('video').exec()
  // const likedVideos = await Like.find({ likedBy: user, video: {$exists: true, $ne: null} }).populate('video') // without exec it will work but it is prefered to use exec

  if(!likedVideos){
    throw new apiError(500, "Something went wrong while fetching liked videos")
  }

  return res
    .status(200)
    .json(new apiResponse(200, likedVideos, "liked video fetched successfuly"))

})

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos
}