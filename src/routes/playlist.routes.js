import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getVideoSavePlaylists,
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(verifyJWT);

// http://localhost:3000/api/v1/playlist/...

router.route("/").post(createPlaylist);
router.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
router.route("/remove/:playlistId/:videoId").patch(removeVideoFromPlaylist);
router
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);
router.route("/users/:userId").get(getUserPlaylists);
router.route("/user/playlists/:videoId").get(getVideoSavePlaylists);

export default router;
