import { cartUpdateSchema } from "../utils/validators/cart.validators.mjs";

const validateCartUpdate = (req, res, next) => {
  const { error } = cartUpdateSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.details[0].message 
    });
  }
  
  next();
};

export { validateCartUpdate };
