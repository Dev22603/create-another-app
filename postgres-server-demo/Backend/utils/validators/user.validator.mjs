import Joi from "joi";
import { USER_VALIDATION_ERRORS } from "../constants/app.messages.mjs";
import { REGEX } from "../constants/app.constants.mjs";

const userSchema = Joi.object({
	name: Joi.string().trim().min(2).max(100).required().messages({
		"any.required": USER_VALIDATION_ERRORS.NAME_REQUIRED,
		"string.empty": USER_VALIDATION_ERRORS.NAME_REQUIRED,
		"string.min": USER_VALIDATION_ERRORS.NAME_MIN,
		"string.max": USER_VALIDATION_ERRORS.NAME_MAX,
	}),
	email: Joi.string().pattern(REGEX.EMAIL).required().messages({
		"any.required": USER_VALIDATION_ERRORS.EMAIL_REQUIRED,
		"string.pattern.base": USER_VALIDATION_ERRORS.EMAIL_INVALID,
	}),
	password: Joi.string().pattern(REGEX.PASSWORD).required().messages({
		"any.required": USER_VALIDATION_ERRORS.PASSWORD_REQUIRED,
		"string.pattern.base": USER_VALIDATION_ERRORS.PASSWORD_INVALID,
	}),
});

export { userSchema };
