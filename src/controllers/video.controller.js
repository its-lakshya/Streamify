import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const user = await req.user;
  if (!user) {
    throw new apiError(404, "Please login to your account to get videos");
  }

  let videos;

  if (userId) {
    videos = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
    ]);
  } else {
    videos = await Video.find();
  }

  if (!videos) {
    throw new apiError(500, "Something went wrong while fetching the user");
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        videos,
        videos.length === 0 ? "No videos found" : "Videos fetched successfully"
      )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;

  if (!user) {
    throw new apiError(404, "Please login to your account to upload video");
  }

  if ([title, description].some((field) => field.trim() === "")) {
    throw new apiError(404, "Title and description both are required");
  }

  const videoLocalPath = req.files?.videoFile[0]?.path;

  if (!videoLocalPath) {
    throw new apiError(400, "Video file is required");
  }

  const videoLink = await uploadOnCloudinary(videoLocalPath);

  if (!videoLink) {
    throw new apiError(400, "Error while uploading the video");
  }

  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!thumbnailLocalPath) {
    throw new apiError(400, "Thumbnail is required");
  }

  const thumbnailLink = await uploadOnCloudinary(thumbnailLocalPath);

  const video = await Video.create({
    videoFile: videoLink?.url,
    thumbnail: thumbnailLink?.url,
    title: title,
    description: description,
    duration: videoLink?.duration,
    isPublished: false,
    owner: user,
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new apiError(500, "Something went wrong while uploading the video");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "Bad request");
  }

  return res
    .status(200)
    .json(new apiResponse(200, video, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const videoLocalPath = req.file?.path;

  if (!videoLocalPath) {
    throw new Error(404, "Video is missing");
  }

  const videoLink = await uploadOnCloudinary(videoLocalPath);

  if (!videoLink) {
    throw new apiError(500, "Error while uploading the video");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        videoFile: videoLink?.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(404, "Bad request");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    throw new apiError(404, "No video found");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(404, "Video id is not provided");
  }

  const video = await Video.findById(videoId);

  if(!video){
    throw new apiError(404, "Bad request, No video found")
  }

  const publishStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new apiResponse(200, publishStatus, publishStatus ? "Video is published successfully" : "Video is unpublished successfully" )
    )
});

export { getAllVideos, publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus };
