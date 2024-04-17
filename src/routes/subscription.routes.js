import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
const router = Router();
router.use(verifyJWT);

// http://localhost:3000/api/v1/subscription/...

router
  .route("/:channelId")
  .patch(toggleSubscription)
  .get(getUserChannelSubscribers);

router.route("/users/:subscriberId").get(getSubscribedChannels);

export default router;
