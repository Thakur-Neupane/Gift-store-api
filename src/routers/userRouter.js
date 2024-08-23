import express from "express";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import {
  getAllUsers,
  getAUser,
  insertUser,
  updateUser,
} from "../models/user/UserModel.js";
import { newUserValidation } from "../middlewares/validation.js";
import {
  deleteManySession,
  deleteSession,
  getSession,
  insertSession,
} from "../models/session/SessionModel.js";
const router = express.Router();
import { v4 as uuidv4 } from "uuid";
import {
  accountUpdatedNotification,
  emailVerificationMail,
  sendOTPMail,
} from "../services/email/nodemailer.js";
import {
  getTokens,
  signAccessJWT,
  signRefreshJWT,
  verifyRefreshJWT,
} from "../utils/jwt.js";
import { auth } from "../middlewares/auth.js";
import { otpGenerator } from "../utils/randmo.js";

router.get("/", auth, (req, res, next) => {
  try {
    const { userInfo } = req;

    userInfo.refreshJWT = undefined;

    userInfo?.status === "active"
      ? res.json({
          status: "success",
          message: "",
          userInfo,
        })
      : res.json({
          status: "error",
          message:
            "Your account has not been activated. Check your email to verify your account",
        });
  } catch (error) {
    next(error);
  }
});

router.post("/", newUserValidation, async (req, res, next) => {
  try {
    // Encrypt password
    req.body.password = hashPassword(req.body.password);

    const user = await insertUser(req.body);

    if (user?._id) {
      // Create unique URL and add in the database
      const token = uuidv4();
      const obj = {
        token,
        associate: user.email,
      };

      const result = await insertSession(obj);
      if (result?._id) {
        // Process for sending email
        emailVerificationMail({
          email: user.email,
          fName: user.fName,
          url:
            process.env.FE_ROOT_URL + `/verify-user?c=${token}&e=${user.email}`,
        });
        return res.json({
          status: "success",
          message:
            "We have sent you an email with instructions to verify your account. Please check your email/junk folder to verify your account",
        });
      }
    }

    res.status(500).json({
      status: "error",
      message: "Error Unable to create an account, Contact administration",
    });
  } catch (error) {
    next(error);
  }
});

// User verification
router.post("/user-verification", async (req, res, next) => {
  try {
    const { c, e } = req.body;
    // Delete session data
    const session = await deleteSession({
      token: c,
      associate: e,
    });
    if (session?._id) {
      // Update user table
      const result = await updateUser(
        { email: e },
        {
          status: "active", // Fixed typo here
          isEmailVerified: true,
        }
      );
      if (result?._id) {
        // Send user an email
        return res.json({
          status: "success",
          message: "Your account has been verified. You may sign in now",
        });
      }
    }

    res.status(400).json({
      status: "error",
      message: "Invalid link, contact admin",
    });
  } catch (error) {
    next(error);
  }
});

// Admin authentication
router.post("/login", async (req, res, next) => {
  try {
    let message = "";
    const { email, password } = req.body;
    // 1. Check if user exists with email
    const user = await getAUser({ email });

    if (user?._id && user?.status === "active" && user?.isEmailVerified) {
      // Verify passwords
      const confirmPass = comparePassword(password, user.password);

      if (confirmPass) {
        // User is now authenticated
        // Create JWTs then return
        return res.json({
          status: "success",
          message: "Login successful",
          jwts: await getTokens(email),
        });
      }
    }

    if (user?.status === "inactive") {
      message = "Your account is not active, contact admin";
    }

    if (!user?.isEmailVerified) {
      message = "User not verified, please check your email and verify";
    }

    res.status(401).json({
      status: "error",
      message: message || "Invalid login details",
    });
  } catch (error) {
    next(error);
  }
});

// Return new accessJWT
router.get("/new-accessjwt", async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    // Verify JWT
    const decode = verifyRefreshJWT(authorization);
    if (decode?.email) {
      // Check if exists in the user table
      const user = await getAUser({
        email: decode.email,
        refreshJWT: authorization,
      });

      if (user?._id) {
        // Create new accessJWT and return
        const accessJWT = await signAccessJWT(decode.email);

        if (accessJWT) {
          return res.json({
            status: "success",
            message: "",
            accessJWT,
          });
        }
      }
    }

    res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  } catch (error) {
    next(error);
  }
});

// Getting all users
router.get("/all", auth, async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json({
      status: "success",
      users,
    });
  } catch (error) {
    next(error);
  }
});

// Logout user
router.delete("/logout", auth, async (req, res, next) => {
  try {
    const { email } = req.userInfo;

    await updateUser({ email }, { refreshJWT: "" });
    // Verify JWT
    await deleteManySession({ associate: email });

    res.json({
      status: "success",
      message: "You are logged out",
    });
  } catch (error) {
    next(error);
  }
});

// Request OTP for password reset
router.post("/otp", async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await getAUser({ email });

    if (user?._id) {
      const token = otpGenerator();

      await insertSession({
        token,
        associate: email,
        type: "otp",
      });

      // Send the email
      sendOTPMail({ token, fName: user.fName, email });

      return res.json({
        status: "success",
        message:
          "If your email is found in our system, we have sent you an OTP to your email. Please check your Inbox/Junk folder",
      });
    }

    res.status(404).json({
      status: "error",
      message: "Email not found",
    });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.patch("/password/reset", async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (email && otp && password) {
      // Verify OTP is valid
      const session = await deleteSession({
        token: otp,
        associate: email,
        type: "otp",
      });

      if (session?._id) {
        // Update user table with new hashed password
        const user = await updateUser(
          { email },
          { password: hashPassword(password) }
        );

        if (user?._id) {
          // Send email notification of account update
          accountUpdatedNotification({ email, fName: user.fName });
          return res.json({
            status: "success",
            message: "Your password has been reset successfully",
          });
        }
      }
    }

    res.status(400).json({
      status: "error",
      message: "Invalid OTP or data request, try again later",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
