import jwt from "jsonwebtoken";
import { insertSession } from "../models/session/SessionModel.js";
import { updateUser } from "../models/user/UserModel.js";

export const signAccessJWT = async (email) => {
  const token = jwt.sign({ email }, process.env.ACCESSJWT_SECRET, {
    expiresIn: "15m",
  });

  const session = await insertSession({ token, associate: email });
  return session._id ? token : null;
};

export const verifyAccessJWT = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.ACCESSJWT_SECRET);
    return decoded;
  } catch (error) {
    return error.message;
  }
};

// =====
export const signRefreshJWT = async (email) => {
  const refreshJWT = jwt.sign({ email }, process.env.REFRESHJWT_SECRET, {
    expiresIn: "30d",
  });

  const user = await updateUser({ email }, { refreshJWT });

  return user._id ? refreshJWT : null;
};

export const verifyRefreshJWT = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESHJWT_SECRET);
  } catch (error) {
    return error.message;
  }
};

export const getTokens = async (email) => {
  return {
    accessJWT: await signAccessJWT(email),
    refreshJWT: await signRefreshJWT(email),
  };
};
