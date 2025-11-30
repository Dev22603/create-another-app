import Joi from "joi";
import { ADDRESS_VALIDATION_ERRORS } from "../constants/app.messages.mjs";

const addressSchema = Joi.object({
	// user_id: Joi.number().integer().min(1).required().messages({
	// 	"any.required": ADDRESS_VALIDATION_ERRORS.USER_ID_REQUIRED,
	// 	"number.base": ADDRESS_VALIDATION_ERRORS.USER_ID_INVALID,
	// 	"number.min": ADDRESS_VALIDATION_ERRORS.USER_ID_MIN,
	// }),

	full_name: Joi.string().min(2).required().messages({
		"any.required": ADDRESS_VALIDATION_ERRORS.FULL_NAME_REQUIRED,
		"string.empty": ADDRESS_VALIDATION_ERRORS.FULL_NAME_REQUIRED,
		"string.min": ADDRESS_VALIDATION_ERRORS.FULL_NAME_MIN,
	}),

	phone: Joi.string()
		.pattern(/^[0-9]{10}$/)
		.required()
		.messages({
			"any.required": ADDRESS_VALIDATION_ERRORS.PHONE_REQUIRED,
			"string.pattern.base": ADDRESS_VALIDATION_ERRORS.PHONE_INVALID,
		}),

	pincode: Joi.string()
		.pattern(/^[1-9][0-9]{5}$/)
		.required()
		.messages({
			"any.required": ADDRESS_VALIDATION_ERRORS.PINCODE_REQUIRED,
			"string.pattern.base": ADDRESS_VALIDATION_ERRORS.PINCODE_INVALID,
		}),

	house_number: Joi.string().trim().required().messages({
		"any.required": ADDRESS_VALIDATION_ERRORS.HOUSE_NUMBER_REQUIRED,
		"string.empty": ADDRESS_VALIDATION_ERRORS.HOUSE_NUMBER_REQUIRED,
	}),

	area: Joi.string().trim().required().messages({
		"any.required": ADDRESS_VALIDATION_ERRORS.AREA_REQUIRED,
		"string.empty": ADDRESS_VALIDATION_ERRORS.AREA_REQUIRED,
	}),

	landmark: Joi.string().trim().allow("").optional(),

	city: Joi.string().trim().required().messages({
		"any.required": ADDRESS_VALIDATION_ERRORS.CITY_REQUIRED,
		"string.empty": ADDRESS_VALIDATION_ERRORS.CITY_REQUIRED,
	}),

	state: Joi.string().trim().required().messages({
		"any.required": ADDRESS_VALIDATION_ERRORS.STATE_REQUIRED,
		"string.empty": ADDRESS_VALIDATION_ERRORS.STATE_REQUIRED,
	}),

	address_type: Joi.string().trim().required().messages({
		"string.empty": ADDRESS_VALIDATION_ERRORS.ADDRESS_TYPE_REQUIRED,
	}),
});

export { addressSchema };
