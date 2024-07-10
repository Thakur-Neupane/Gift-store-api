import SessionSchema from "./SessionSchema.js";

export const insertSession = (sessionObj) => {
  return SessionSchema(sessionObj).save();
};

export const getSession = (filter) => {
  return SessionSchema.findOne(filter);
};

export const deleteSession = (filter) => {
  return SessionSchema.findOneAndDelete(filter);
};

export const deleteManySession = (filter) => {
  return SessionSchema.deleteMany(filter);
};
