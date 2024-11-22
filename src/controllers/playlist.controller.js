import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  if (!(name || description)) {
    throw new ApiError(400, "all fields are required");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(500, "something went wrong while creating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const getUserPlaylists = await Playlist.find({ owner: userId });

  if (!getUserPlaylists) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        getUserPlaylists,
        "User playlist fetched successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!playlistId) {
    throw new ApiError(400, "PlaylistId is required");
  }

  const playlist = await Playlist.findById(playlistId).select("-owner");

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId || videoId)) {
    throw new ApiError(400, "all fields are required");
  }

  const addPlaylist = Playlist.findByIdAndUpdate(
    playlistId,
    [
      {
        $set: {
          videos: videoId,
        },
      },
    ],
    {
      new: true,
    }
  );

  if (!addPlaylist) {
    throw new ApiError(500, "error while adding video to playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, addPlaylist, "Video is added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!(playlistId || videoId)) {
    throw new ApiError(400, "all fields are required");
  }

  const removeVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      new: true,
    }
  ).select("-owner");

  if (!removeVideo) {
    throw new ApiError(
      500,
      "Something went wrong while removing video from playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, removeVideo, "Video removed successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!playlistId) {
    throw new ApiError(400, "PlaylistId is required");
  }

  const deleteplaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deleteplaylist) {
    throw new ApiError(500, "something went wrong while deleating playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist

  if (!(name || description)) {
    throw new ApiError(400, "all fields are required");
  }

  const updateplaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  ).select("-owner");

  if (!updateplaylist) {
    throw new ApiError(500, "something went wrong while updating playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateplaylist, "updating playlist successfull")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
