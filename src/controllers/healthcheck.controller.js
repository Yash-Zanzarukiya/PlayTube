import { asyncHandler } from "../utils/asyncHandler.js";
import { apiresponses as APIResponse } from "../errorUtils/apiresponses.js";

const healthcheck = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new APIResponse(200, { status: "OK" }, "Health is good"));
});

export { healthcheck };
