import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js"
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const user = req.user;

  if(!mongoose.isValidObjectId(subscriberId)){
    throw new apiError(404, "Invalid subscriberId")
  }

  if(!user){
    throw new apiError(404, "Unauthorized request");
  }

  const channel = await User.findById(subscriberId);

  if(!channel){
    throw new apiError(404, "No channel found");
  }

  const alreadySubscribed = await Subscription.findOne({channel, subscriber: user})

  if(alreadySubscribed){
    const deleteSubscription = await Subscription.findByIdAndDelete(alreadySubscribed._id);

    if(!deleteSubscription){
      throw new apiError(500, "Something went wrong while unsubscribing the channel");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Channel unsubscribed successfuly"));
  }
  else{
    const subscribed = await Subscription.create({
      subscriber: user,
      channel
    })

    if(!subscribed){
      throw new apiError(500, "Something went wrong while subscribing the channel");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "Channel subscribed"))
  }


})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
  
})

export {
  getSubscribedChannels,
  toggleSubscription,
  getUserChannelSubscribers
}