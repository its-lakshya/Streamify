import mongoose, { mongo } from "mongoose";
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const user = req.user;

  if(!user){
    throw new apiError(404, "Unauthorized request");
  }

  const videos = await Video.find({owner: user});
  const totalVideos = videos.length;

  if(!totalVideos){
    throw new apiError(500, "Something went wrong while fetching total videos")
  }

  const subscribers = await Subscription.find({channel: user});

  if(!subscribers){
    throw new apiError(500, "Something went wrong while fetching subscribers")
  }

  const totalSubscribers = subscribers.length;

  const videoLikes = await Like.aggregate([
    {
      $match: {
        video: {$ne: null},
        comment: {$exists: false},
        tweet: {$exists: false}
      }
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'video',
        foreignField: '_id',
        as: 'likedVideoOwner',
        pipeline: [
          {
            $project: {
              owner: 1
            }
          }
        ]
      }
    },
    {
      $unwind: '$likedVideoOwner'  // Assuming there's exactly one owner for each liked video
    },
    {
      $match: {
        'likedVideoOwner.owner': user._id
      }
    }
  ])

  if(!videoLikes){
    throw new apiError(500, "Something went wrong while fetching likes")
  }

  const totalLikes = videoLikes.length;


  return res
    .status(200)
    .json(new apiResponse(200, {totalVideos, totalSubscribers, totalLikes}, "Channel stats fetched successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
  const user = req.user;

  if(!user){
    throw new apiError(404, "Unauthorized request");
  }

  const videos = await Video.find({owner: user});
  if(!videos){
    throw new apiError(500, "Something went wrong while fetching the videos");
  }

  return res
    .status(200)
    .json(new apiResponse(200, videos, "Videos fetched successfully"));

})

export {
  getChannelStats,
  getChannelVideos
}