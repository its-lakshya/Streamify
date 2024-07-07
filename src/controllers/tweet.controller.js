import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiresponse.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const user = req.user;

  if (!user) {
    throw new apiError(
      404,
      "Unauthorized request: Please login to create tweet"
    );
  }

  if (content === null || content === "") {
    throw new apiError(404, "No tweet provided");
  }

  const tweet = new Tweet({
    content: content,
    owner: user,
  });

  await tweet.save();

  const addedTweet = await Tweet.findById(tweet._id);

  if (!addedTweet) {
    throw new apiError(500, "Something went wrong while creating tweet");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Tweet is added successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params

  if(!userId){
    throw new apiError(404, "Unauthorized request")
  }

  const user = await User.findById(userId)

  const tweets = await Tweet.find({ owner: user });

  return res
    .status(200)
    .json(new apiResponse(200, tweets, "Tweets fetched succussfuly"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body

  if(!mongoose.isValidObjectId(tweetId)){
    throw new apiError("Invalid tweet id")
  }

  if(!content || content === ""){
    throw new apiError("No tweet provided")
  }

  const tweet = await Tweet.findByIdAndUpdate(tweetId, {content: content}, {new: true})

  if(!tweet){
    throw new apiError(500, "Something went wrong while updtating the tweet")
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Tweet updated successfully"))

});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if(!mongoose.isValidObjectId(tweetId)){
    throw new apiError(404, "Invalid tweetId")
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId, {new: true});

  if(!tweet){
    throw new apiError(500, "Something went wrong while deleting the tweet")
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Tweet deleted succussfuly"));

});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
