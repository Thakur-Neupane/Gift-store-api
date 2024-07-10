import { decode } from "jsonwebtoken";
import { getSession } from "../models/session/SessionModel.js";
import { getAUser } from "../models/user/UserModel.js";
import { verifyAccessJWT } from "../utils/jwt.js";

export const auth = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    let message = "";
    if (authorization) {
      const decoded = await verifyAccessJWT(authorization);
      if (decoded === "jwt expired") message = "jwt expired";

      if (decoded?.email) {
        const session = await getSession({
          token: authorization,
          associate: decoded.email,
        });
        if (session?._id) {
          const user = await getAUser({ email: decoded.email });

          if (user?._id && user?.isEmailVerified && user?.status === "active") {
            user.password = undefined;
            user.__v = undefined;
            req.userInfo = user;
            return next();
          }

          if (user?.status === "inactive") {
            message = "Your account is not active, contact admin";
          }

          if (!user?.isEmailVerified) {
            message = "User not verified, please check your email and verify";
          }
        }
      }
    }

    const statusCode = message == "jwt expired" ? 403 : 401;
    res.status(statusCode).json({
      statu: "error",
      message: message || "unauthorized",
    });
  } catch (error) {
    next(error);
  }
};
