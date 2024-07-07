import { Tweet } from "../models/tweet.model"
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler"

const createTweet = asyncHandler(async (req, res) => {
  const tweet = req.body?.content;
  const user = req.user;

  if(!user){
    throw new apiError(404, "Unauthorized request: Please login to create tweet");
  }

  if(tweet === null || tweet === ""){
    throw new apiError(404, "No tweet provided");
  }

  // const 

})

const getUserTweets = asyncHandler(async (req, res) => {

})

const updateTweet = asyncHandler(async (req, res) => {

})

const deleteTweet = asyncHandler(async (req, res) => {

})

export{
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet
}