import Joi from "joi";
import { CART_VALIDATION_ERRORS } from "../constants/app.messages.mjs";

const cartUpdateSchema = Joi.object({
  product_id: Joi.number().integer().min(1).required().messages({
    "any.required": CART_VALIDATION_ERRORS.PRODUCT_ID_REQUIRED,
    "number.base": CART_VALIDATION_ERRORS.PRODUCT_ID_INVALID,
    "number.min": CART_VALIDATION_ERRORS.PRODUCT_ID_MIN,
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    "any.required": CART_VALIDATION_ERRORS.QUANTITY_REQUIRED,
    "number.base": CART_VALIDATION_ERRORS.QUANTITY_INVALID,
    "number.min": CART_VALIDATION_ERRORS.QUANTITY_MIN,
  }),
});

export { cartUpdateSchema };
