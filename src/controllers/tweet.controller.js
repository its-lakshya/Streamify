import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiresponse.js";

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
  
});

const deleteTweet = asyncHandler(async (req, res) => {});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
