import UserSchema from "./UserSchema.js";

export const insertUser = (userObj) => {
  return UserSchema(userObj).save();
};

export const getAUser = (filter) => {
  return UserSchema.findOne(filter);
};

export const getAllUsers = () => {
  return UserSchema.find();
};

export const updateUserById = ({ _id, obj }) => {
  return UserSchema.findByIdAndUpdate(_id, obj);
};

export const updateUser = (filter, obj) => {
  return UserSchema.findOneAndUpdate(filter, obj);
};
