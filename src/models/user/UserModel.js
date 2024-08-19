import UserSchema from "./UserSchema.js";

export const insertUser = (userObj) => {
  return UserSchema(userObj).save();
};

export const getAUser = (filter) => {
  return UserSchema.findOne(filter);
};

export const getAllUsers = async () => {
  try {
    return await UserSchema.find();
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Error fetching users from the database.");
  }
};

export const updateUserById = ({ _id, obj }) => {
  return UserSchema.findByIdAndUpdate(_id, obj);
};

export const updateUser = (filter, obj) => {
  return UserSchema.findOneAndUpdate(filter, obj);
};
