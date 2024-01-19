import { Router } from "express";
import {
  avatarImageUpdate,
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
  updateUserDetails,
  userDetails,
} from "../controllers/user.controller.js";
const router = Router();
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/changePassword").post(verifyJWT, changePassword);
router.route("/me").post(verifyJWT, userDetails);
// updater username
router.route("/update_user").post(verifyJWT, updateUserDetails);
router
  .route("/updateAvatar")
  .post(verifyJWT, upload.single("avatar"), avatarImageUpdate);
export default router;
