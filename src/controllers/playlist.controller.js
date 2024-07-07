import mongoose from "mongoose";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { Playlist } from "../models/playlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, videos } = req.body;
  const user = req.user;

  if(!user){
    throw new apiError(404, "Unauthorized request please login to create playlist")
  }

  if(!name){
    throw new apiError(404, "playlist name is required")
  }

  if(!description){
    throw new apiError(404, "playlist description is required")
  }

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: user,
    videos,
  })

  const createdPlaylist = await Playlist.findById(newPlaylist._id);

  if(!createdPlaylist){
    throw new apiError(500, "Something went wrong while creating playlist")
  }

  return res
    .status(200)
    .json(new apiResponse(200, createdPlaylist, "Playlist created succussfully"))

});

const getPlaylistById = asyncHandler(async (req, res) => {
  

});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { playlistId } = req.params;

  if(!mongoose.isValidObjectId(playlistId)){
    throw new apiError(404, "Invalid playlist id")
  }

  if(!name){
    throw new apiError(404, "playlist name is required")
  }

  if(!description){
    throw new apiError(404, "playlist description is required")
  }



});

const deletePlaylist = asyncHandler(async (req, res) => {
  

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  
  
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if(!mongoose.isValidObjectId(userId)){
    throw new apiError(404, "Invalid user id")
  }

  const user = await User.findById(userId);

  if(!user){
    throw new apiError(404, "No user found");
  }

  const userPlaylist = await Playlist.find({owner: user})

  if(!userPlaylist){
    throw new apiError(500, "Something went wrong while fetching user playlist")
  }

  return res
    .status(200)
    .json(new apiResponse(200, userPlaylist, "User playlist fetched successfully"))

});

export {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
};