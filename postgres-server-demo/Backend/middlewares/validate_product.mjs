import { productSchema } from "../utils/validators/product.validator.mjs";

const validateProduct = (req, res, next) => {
	const { error } = productSchema.validate(req.body);
	if (error) {
		return res.status(400).json({ message: error.details[0].message });
	}
	next();
};
export { validateProduct };
