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
  const { channelId } = req.params;

  if(!mongoose.isValidObjectId(channelId)){
    throw new apiError(404, "Invalid channel id")
  }

  const channel = await User.findById(channelId);

  if(!channel){
    throw new apiError(404, "No channel found");
  }

  const subscribers = await Subscription.find({channel}).populate('subscriber').exec();

  if(!subscribers){
    throw new apiError(500, "Something went wrong while fetching subscribers list");
  }

  return res
    .status(200)
    .json(new apiResponse(200, subscribers, "Subscribers list fetched successfuly"));

})

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if(!mongoose.isValidObjectId(subscriberId)){
    throw new apiError(404, "Invalid subscriber id");
  }

  const user = await User.findById(subscriberId);

  if(!user){
    throw new apiError(404, "No such user found");
  }

  // const subscribedChannels = await Subscription.find({ subscriber: user }).populate('subscriber').populate('channel').exec();
  const subscribedChannels = await Subscription.find({ subscriber: user });

  if(!subscribedChannels){
    throw new apiError(500, "Something went wrong while fetching the subscribed channels list");
  }

  return res
    .status(200)
    .json(new apiResponse(200, subscribedChannels, "Subscribed channel list fetched successfuly"));

})

export {
  getSubscribedChannels,
  toggleSubscription,
  getUserChannelSubscribers
}