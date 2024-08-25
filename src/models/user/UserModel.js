import UserSchema from "./UserSchema.js";

// Insert a new user
export const insertUser = (userObj) => {
  return UserSchema(userObj).save();
};

// Find a user based on a filter
export const getAUser = (filter) => {
  return UserSchema.findOne(filter);
};

// Get all users
export const getAllUsers = async () => {
  try {
    return await UserSchema.find();
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Error fetching users from the database.");
  }
};

// Update a user based on a filter
export const updateUser = (filter, obj) => {
  return UserSchema.findOneAndUpdate(filter, obj, { new: true });
};

// Get a single user by ID
export const getOneUser = (id) => {
  return UserSchema.findById(id);
};

// Function to update a user by ID
export const updateUserById = (id, obj) => {
  return UserSchema.findByIdAndUpdate(id, obj, { new: true });
};
