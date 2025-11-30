import Joi from "joi";
import { PRODUCT_VALIDATION_ERRORS } from "../constants/app.messages.mjs";

const productSchema = Joi.object({
	product_name: Joi.string().trim().required().messages({
		"any.required": PRODUCT_VALIDATION_ERRORS.NAME_REQUIRED,
		"string.empty": PRODUCT_VALIDATION_ERRORS.NAME_REQUIRED,
	}),
	sales_price: Joi.number().min(1).required().messages({
		"any.required": PRODUCT_VALIDATION_ERRORS.SALES_PRICE_REQUIRED,
		"number.base": PRODUCT_VALIDATION_ERRORS.SALES_PRICE_INVALID,
		"number.min": PRODUCT_VALIDATION_ERRORS.SALES_PRICE_MIN,
	}),
	mrp: Joi.number().min(1).required().messages({
		"any.required": PRODUCT_VALIDATION_ERRORS.MRP_REQUIRED,
		"number.base": PRODUCT_VALIDATION_ERRORS.MRP_INVALID,
		"number.min": PRODUCT_VALIDATION_ERRORS.MRP_MIN,
	}),
	category_id: Joi.number().integer().min(1).required().messages({
		"any.required": PRODUCT_VALIDATION_ERRORS.CATEGORY_ID_REQUIRED,
		"number.base": PRODUCT_VALIDATION_ERRORS.CATEGORY_ID_INVALID,
		"number.min": PRODUCT_VALIDATION_ERRORS.CATEGORY_ID_MIN,
	}),
	stock: Joi.number().integer().min(0).required().messages({
		"any.required": PRODUCT_VALIDATION_ERRORS.STOCK_REQUIRED,
		"number.base": PRODUCT_VALIDATION_ERRORS.STOCK_INVALID,
		"number.min": PRODUCT_VALIDATION_ERRORS.STOCK_MIN,
	}),
});

export { productSchema };
