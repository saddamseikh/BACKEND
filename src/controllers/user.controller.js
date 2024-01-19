import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
const cookieOptions = {
  secure: process.env.NODE_ENV === "production" ? true : false,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (!fullName || !email || !password || !username) {
    throw new ApiError(400, "All field are required");
  }

  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  if (!user) {
    throw new ApiError(400, "User registration failed, please try again later");
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

// logout controller
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const changePassword = asyncHandler(async (req, res, next) => {
  const { oldpssword, newPassword } = req.body;
  // Check if the values are there or not
  if (!oldpssword || !newPassword) {
    throw new ApiError(400, "Old password and new password are required");
  }
  const user = await User.findById(req.user?.id);
  // console.log(user);
  // If no user then throw an error message
  if (!user) {
    throw new ApiError(400, "Invalid user id or user does not exist");
  }
  // Check if the old password is correct
  const isValidPassword = await user.comparePassword(oldpssword);
  if (!isValidPassword) {
    throw new ApiError(400, "Invalid old password");
  }
  // Setting the new password
  user.password = newPassword;
  // Save the data in DB
  await user.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password successfully changed"));
});
/**
 * @FETCH_USER_DETAILS
 * @ROUTE @POST {{URL}}/api/v1/users
 * @ACCESS loggedin in user
 */
// Getuser details
const userDetails = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  user.password = undefined;
  user.refreshToken = undefined;
  res.status(200).json({
    success: true,
    user,
    message: "User details fetch successfully",
  });
});

/**
 * @UPDATE_USER_USERNAME_FULLNANE
 * @ROUTE @POST {{URL}}/api/v1/users/update_user
 * @ACCESS loggedin in user
 */
// Getuser details
const updateUserDetails = asyncHandler(async (req, res) => {
  const { username, fullName } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: username,
        fullName: fullName,
      },
    },
    { new: true }
  );
  user.password = undefined;
  user.refreshToken = undefined;
  res.status(200).json({
    success: true,
    message: "Updated user Name",
    user,
  });
});
/**
 * @UPDATE_USER_USERNAME_FULLNANE
 * @ROUTE @POST {{URL}}/api/v1/users/update_user
 * @ACCESS loggedin in user
 */
// Getuser details

const avatarImageUpdate = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  console.log(avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(avatar.url);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  );
  user.password = undefined;
  user.refreshToken = undefined;

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
  userDetails,
  updateUserDetails,
  avatarImageUpdate,
};
