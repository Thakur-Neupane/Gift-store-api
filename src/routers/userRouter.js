import express from "express";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import {
  getAllUsers,
  getAUser,
  getOneUser,
  insertUser,
  updateUser,
  updateUserById,
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
import UserSchema from "../models/user/UserSchema.js";

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
            "your account has not been activated. Check your email to verify your account",
        });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    // Encrypt password
    req.body.password = hashPassword(req.body.password);

    // Validate gender
    const validGenders = ["male", "female", "preferNotToSay"];
    if (!validGenders.includes(req.body.gender)) {
      console.error(`Invalid gender value: ${req.body.gender}`);
      return res
        .status(400)
        .json({ status: "error", message: "Invalid gender value" });
    }

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
        // Send verification email
        emailVerificationMail({
          email: user.email,
          fName: user.fName,
          url:
            process.env.FE_ROOT_URL + `/verify-user?c=${token}&e=${user.email}`,
        });
        return res.json({
          status: "success",
          message:
            "We have sent you an email with instructions to verify your account. Please check your email/junk folder.",
        });
      }
    }

    res.json({
      status: "error",
      message: "Unable to create an account. Contact administration.",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    next(error);
  }
});

//user verification
router.post("/user-verification", async (req, res, next) => {
  try {
    const { c, e } = req.body;
    //delete session data

    const session = await deleteSession({
      token: c,
      associate: e,
    });
    if (session?._id) {
      //update user table
      const result = await updateUser(
        { email: e },
        {
          staus: "active",
          isEmailVerified: true,
        }
      );
      if (result?._id) {
        // send user an email
        return res.json({
          status: "success",
          message: "Your account has been verified. You may sign in now",
        });
      }
    }

    res.json({
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
    // 1. cheich if user exist with email
    const user = await getAUser({ email });

    if (user?._id && user?.status === "active" && user?.isEmailVerified) {
      //verify passwords

      const confirmPass = comparePassword(password, user.password);

      if (confirmPass) {
        //useris now authenticated

        // create jwts then return

        return res.json({
          status: "success",
          message: "Login Successfull",
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

    res.json({
      status: "error",
      message: message || "Invalid login details",
    });
  } catch (error) {
    next(error);
  }
});

// return new accessJWT
router.get("/new-accessjwt", async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    // verify jwt

    const decode = verifyRefreshJWT(authorization);
    console.log(decode, "--------");
    if (decode?.email) {
      // check if exist in the user table,
      const user = await getAUser({
        email: decode.email,
        refreshJWT: authorization,
      });

      if (user?._id) {
        // create new accessJWT and return

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

// getting all users
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
    // verify jwt
    await deleteManySession({ associate: email });

    res.json({
      status: "success",
      message: "you are loggedout",
    });
  } catch (error) {
    next(error);
  }
});
// request OTP for password reset
router.post("/otp", async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(req.body, "lll");

    const user = await getAUser({ email });

    if (user?._id) {
      const token = otpGenerator();

      await insertSession({
        token,
        associate: email,
        type: "otp",
      });

      //send the email
      sendOTPMail({ token, fName: user.fName, email });
    }

    res.json({
      status: "success",
      message:
        "If your email is found in our system, We have sent you an OTP in your email, please check your Inbox/Junk folder",
    });
  } catch (error) {
    next(error);
  }
});
// request OTP for password reset
router.post("/otp", async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(req.body, "lll");

    const user = await getAUser({ email });

    if (user?._id) {
      const token = otpGenerator();

      await insertSession({
        token,
        associate: email,
        type: "otp",
      });

      //send the email
      sendOTPMail({ token, fName: user.fName, email });
    }

    res.json({
      status: "success",
      message:
        "If your email is found in our system, We have sent you an OTP in your email, please check your Inbox/Junk folder",
    });
  } catch (error) {
    next(error);
  }
});
// request OTP for password reset
router.patch("/password/reset", async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if ((email, otp, password)) {
      // verify otp is valid

      const session = await deleteSession({
        token: otp,
        associate: email,
        type: "otp",
      });

      if (session?._id) {
        //update user table with new hashPass

        const user = await updateUser(
          { email },
          { password: hashPassword(password) }
        );

        if (user?._id) {
          //send email notification of account update
          accountUpdatedNotification({ email, fName: user.fName });
          return res.json({
            status: "success",
            message: "Your password reseted successfully",
          });
        }
      }
    }

    res.json({
      status: "error",
      message: "Invalid otp or data reqeust, try agian later",
    });
  } catch (error) {
    next(error);
  }
});

// Get a single user by id
router.get("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getOneUser(id);

    if (user) {
      res.json({
        status: "success",
        user,
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Delete a user by ID
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getOneUser(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await UserSchema.findByIdAndDelete(id);

    res.json({
      status: "success",
      message: "User successfully deleted",
    });
  } catch (error) {
    next(error);
  }
});

// Middleware to validate roles
const validRoles = ["admin", "user"];

const validateRole = (role) => {
  return validRoles.includes(role);
};

// Route to update user role
router.patch("/:id/role", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({
        status: "error",
        message: "Role must be provided",
      });
    }

    if (!validateRole(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role value",
      });
    }

    // Check if user exists
    const user = await getOneUser(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Update user role
    const updatedUser = await updateUserById(id, { role });

    if (updatedUser) {
      res.json({
        status: "success",
        message: "User role updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Failed to update user role",
      });
    }
  } catch (error) {
    next(error);
  }
});

// Update user status
router.patch("/:id/status", auth, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting the new status in the request body

    if (!status) {
      return res.status(400).json({
        status: "error",
        message: "Status must be provided",
      });
    }

    // Validate status value
    const validStatuses = ["active", "inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid status value",
      });
    }

    // Check if user exists
    const user = await getOneUser(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    // Update user status
    const updatedUser = await updateUserById(id, { status });

    if (updatedUser) {
      res.json({
        status: "success",
        message: "User status updated successfully",
        user: updatedUser,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Failed to update user status",
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;
