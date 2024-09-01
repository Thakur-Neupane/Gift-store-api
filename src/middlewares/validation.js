import Joi from "joi";

// Define schemas with more explicit constraints and formatting
const SHORT_STR = Joi.string().max(100);
const SHORT_STR_REQ = Joi.string().max(100).required();

const LONG_STR = Joi.string().max(5000);
const LONG_STR_REQ = Joi.string().max(5000).required();

// Use string for PHONE and consider a regex or custom validation if needed
const PHONE = Joi.string()
  .pattern(/^[0-9+\-()\s]*$/)
  .allow("", null);
const PHONE_REQ = Joi.string()
  .pattern(/^[0-9+\-()\s]*$/)
  .required();

// Define EMAIL validation schema
const EMAIL = Joi.string().email({ minDomainSegments: 2 }).allow("", null);
const EMAIL_REQ = Joi.string().email({ minDomainSegments: 2 }).required();

const validator = (req, res, next, schema) => {
  try {
    const { error } = schema.validate(req.body, { abortEarly: false }); // Improved validation settings
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details.map((detail) => detail.message).join(", "), // Aggregate all error messages
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const newUserValidation = (req, res, next) => {
  const schema = Joi.object({
    fName: SHORT_STR_REQ,
    lName: SHORT_STR_REQ,
    phone: PHONE,
    email: EMAIL_REQ,
    password: SHORT_STR_REQ,
  });

  return validator(req, res, next, schema);
};
