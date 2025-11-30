// Backend\routes\product.routes.mjs
import express from "express";
import {
	createCategory,
	createProduct,
	deleteProduct,
	getAllProducts,
	getCategories,
	getProductById,
	getProductsByCategory,
	searchProductsByName,
	updateProduct,
} from "../controllers/product.controller.mjs";
import { authenticate, authorize } from "../middlewares/auth.mjs";
import { uploadProductImages } from "../middlewares/uploads.mjs";
import { validateProduct } from "../middlewares/validate_product.mjs";
const router = express.Router();

router.post(
	"/",
	authenticate,
	authorize(["admin"]),
	uploadProductImages,
	validateProduct,
	createProduct
);
router.delete("/:id", authenticate, authorize(["admin"]), deleteProduct);
router.put("/:id", authenticate, authorize(["admin"]),uploadProductImages, updateProduct);
router.post(
	"/new_category",
	authenticate,
	authorize(["admin"]),
	createCategory
);

router.get("/id/:id", getProductById);
router.get("/", getAllProducts);
router.get("/categories", getCategories);
router.get("/product_name/:product_name", searchProductsByName); //customer end
router.get("/category_id/:category_id", getProductsByCategory); //customer end

export default router;
