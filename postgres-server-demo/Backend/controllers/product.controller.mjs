import { pool } from "../db/db.mjs";
import {
	CHECK_CATEGORY_EXISTS,
	INSERT_PRODUCT,
	COUNT_PRODUCTS_BY_NAME,
	SEARCH_PRODUCTS_BY_NAME,
	GET_PRODUCTS_BY_CATEGORY,
	COUNT_PRODUCTS_BY_CATEGORY,
	COUNT_PRODUCTS,
	GET_PRODUCTS_PAGINATION,
	GET_PRODUCT_BY_ID,
	DELETE_PRODUCT,
	GET_CATEGORIES,
	INSERT_CATEGORY,
} from "../queries/product.queries.mjs";
import { validatePagination } from "../utils/common_functions.mjs";
import {
	GLOBAL_ERROR_MESSAGES,
	PRODUCT_FEEDBACK_MESSAGES,
	PRODUCT_VALIDATION_ERRORS,
} from "../utils/constants/app.messages.mjs";
import { productSchema } from "../utils/validators/product.validator.mjs";

const createProduct = async (req, res) => {
	try {
		//TODO: add a check for sales_price<=mrp


		const parsedBody = {
			product_name: req.body.product_name?.trim(),
			sales_price: parseInt(req.body.sales_price.trim()),
			mrp: parseInt(req.body.mrp.trim()),
			category_id: parseInt(req.body.category_id.trim()),
			stock: parseInt(req.body.stock.trim()),
		};

		const { error } = productSchema.validate(parsedBody, {
			abortEarly: false,
		});
		if (error) {
			const errors = error.details.map((e) => e.message);
			return res
				.status(400)
				.json({ message: "Validation failed", errors });
		}

		const categoryExists = await pool.query(CHECK_CATEGORY_EXISTS, [
			parsedBody.category_id,
		]);
		if (categoryExists.rows.length === 0) {
			return res
				.status(400)
				.json({ error: PRODUCT_VALIDATION_ERRORS.CATEGORY_NOT_FOUND });
		}

		const imageURLs = req.files
			? req.files.map((file) => `/uploads/${file.filename}`)
			: [];

		if (imageURLs.length === 0) {
			return res
				.status(400)
				.json({ message: PRODUCT_VALIDATION_ERRORS.IMAGE_REQUIRED });
		}
		if(parsedBody.sales_price>parsedBody.mrp){
			return res.status(400).json({
				message: PRODUCT_VALIDATION_ERRORS.SALES_PRICE_GREATER_THAN_MRP,
			});
		}

		const result = await pool.query(INSERT_PRODUCT, [
			parsedBody.product_name,
			parsedBody.sales_price,
			parsedBody.mrp,
			imageURLs,
			parsedBody.category_id,
			parsedBody.stock,
		]);

		return res.status(201).json({
			message: PRODUCT_FEEDBACK_MESSAGES.PRODUCT_ADDED_SUCCESS,
			data: result.rows[0],
		});
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

const searchProductsByName = async (req, res) => {
	const { product_name } = req.params;
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 10;
	const offset = (page - 1) * limit;

	try {
		// Execute search query
		const { rows: products } = await pool.query(SEARCH_PRODUCTS_BY_NAME, [
			`%${product_name}%`,
			limit,
			offset,
		]);
		// Get total count
		const { rows } = await pool.query(COUNT_PRODUCTS_BY_NAME, [
			`%${product_name}%`,
		]);
		const totalCount = parseInt(rows[0].count, 10);

		return res.status(200).json({
			products,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
			...(totalCount === 0 && {
				message: PRODUCT_FEEDBACK_MESSAGES.NO_PRODUCTS_FOUND,
			}),
		});
	} catch (err) {
		return res
			.status(500)
			.json({ message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR });
	}
};
const getProductsByCategory = async (req, res) => {
	const { category_id } = req.params;
	console.log(category_id);

	const { page, limit, offset } = validatePagination(req);

	try {
		// Fetch products by category_id with pagination
		const result = await pool.query(GET_PRODUCTS_BY_CATEGORY, [
			category_id,
			limit,
			offset,
		]);

		const totalCountResult = await pool.query(COUNT_PRODUCTS_BY_CATEGORY, [
			category_id,
		]);
		const totalCount = parseInt(totalCountResult.rows[0].count, 10);

		return res.status(200).json({
			products: result.rows,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
			...(totalCount === 0 && {
				message: PRODUCT_FEEDBACK_MESSAGES.NO_PRODUCTS_FOUND,
			}),
		});
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

const createCategory = async (req, res) => {
	const category_name = req.body.category_name?.trim().toLowerCase();

	try {
		const categoryExists = await pool.query(CHECK_CATEGORY_EXISTS, [
			category_name,
		]);
		if (categoryExists.rows[0].exists) {
			return res.status(200).json({ message: "Category already exists" });
		}
		const result = await pool.query(INSERT_CATEGORY, [category_name]);
		const category = result.rows[0];
		return res.status(201).json(category);
	} catch (err) {
		return res
			.status(500)
			.json({ message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR, error: err });
	}
};
const getAllProducts = async (req, res) => {
	try {
		const { page, limit, offset } = validatePagination(req);
		const result = await pool.query(GET_PRODUCTS_PAGINATION, [
			limit,
			offset,
		]);
		const totalCountResult = await pool.query(COUNT_PRODUCTS);
		const totalCount = parseInt(totalCountResult.rows[0].count, 10);
		return res.status(200).json({
			products: result.rows,
			totalCount,
			page,
			limit,
			totalPages: Math.ceil(totalCount / limit),
			...(totalCount === 0 && {
				message: PRODUCT_FEEDBACK_MESSAGES.NO_PRODUCTS_FOUND,
			}),
		});
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

const getProductById = async (req, res) => {
	const { id } = req.params;

	try {
		if (isNaN(id)) {
			return res.status(400).json({
				error: "id is an integer",
			});
		}
		const result = await pool.query(GET_PRODUCT_BY_ID, [id]);
		const product = result.rows[0];

		if (!product) {
			return res.status(404).json({
				error: PRODUCT_FEEDBACK_MESSAGES.NO_PRODUCT_FOUND_BY_ID,
			});
		}

		return res.status(200).json(product);
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

const getCategories = async (req, res) => {
	try {
		const result = await pool.query(GET_CATEGORIES);

		return res.status(200).json(result.rows);
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

const deleteProduct = async (req, res) => {
	const { id } = req.params;

	try {
		if (isNaN(id)) {
			return res.status(400).json({
				error: "id is an integer",
			});
		}
		const result = await pool.query(DELETE_PRODUCT, [id]);
		const product = result.rows[0];

		if (!product) {
			return res.status(200).json({
				message: PRODUCT_FEEDBACK_MESSAGES.NO_PRODUCT_FOUND_BY_ID,
			});
		}

		return res.status(200).json({ message: "Product deleted" });
	} catch (err) {
		return res
			.status(500)
			.json({ message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR });
	}
};

const updateProduct = async (req, res) => {
	try {
		//TODO: add a check for sales_price<=mrp
		const { id } = req.params;

		const parsedBody = {
			product_name: req.body.product_name?.trim(),
			sales_price: parseInt(req.body.sales_price?.trim()),
			mrp: parseInt(req.body.mrp?.trim()),
			category_id: parseInt(req.body.category_id?.trim()),
			stock: parseInt(req.body.stock?.trim()),
		};

		// Validate product exists
		const productExists = await pool.query(GET_PRODUCT_BY_ID, [id]);
		if (!productExists.rows[0]) {
			return res.status(404).json({
				error: PRODUCT_FEEDBACK_MESSAGES.NO_PRODUCT_FOUND_BY_ID,
			});
		}

		// Validate category if provided
		if (parsedBody.category_id) {
			const categoryExists = await pool.query(CHECK_CATEGORY_EXISTS, [
				parsedBody.category_id,
			]);
			if (categoryExists.rows.length === 0) {
				return res.status(400).json({
					error: PRODUCT_VALIDATION_ERRORS.CATEGORY_NOT_FOUND,
				});
			}
		}

		// Handle image uploads
		const imageURLs = req.files
			? req.files.map((file) => `/uploads/${file.filename}`)
			: [];

		// Build update query parameters
		const updateParams = [];
		const setClause = [];
		let paramIndex = 1;

		// Only update fields that are provided
		if (parsedBody.product_name) {
			setClause.push(`product_name = $${paramIndex}`);
			updateParams.push(parsedBody.product_name);
			paramIndex++;
		}

		if (parsedBody.sales_price) {
			setClause.push(`sales_price = $${paramIndex}`);
			updateParams.push(parsedBody.sales_price);
			paramIndex++;
		}

		if (parsedBody.mrp) {
			setClause.push(`mrp = $${paramIndex}`);
			updateParams.push(parsedBody.mrp);
			paramIndex++;
		}

		if (parsedBody.category_id) {
			setClause.push(`category_id = $${paramIndex}`);
			updateParams.push(parsedBody.category_id);
			paramIndex++;
		}

		if (parsedBody.stock) {
			setClause.push(`stock = $${paramIndex}`);
			updateParams.push(parsedBody.stock);
			paramIndex++;
		}

		// Add existing images if no new images were uploaded
		if (imageURLs.length === 0) {
			const existingImages = await pool.query(
				`SELECT images FROM Products WHERE id = $1`,
				[id]
			);
			if (existingImages.rows[0]?.images) {
				setClause.push(`images = $${paramIndex}`);
				updateParams.push(existingImages.rows[0].images);
				paramIndex++;
			}
		} else {
			setClause.push(`images = $${paramIndex}`);
			updateParams.push(imageURLs);
			paramIndex++;
		}

		// Add product ID as last parameter
		updateParams.push(id);

		// Build and execute update query
		const result = await pool.query(
			`UPDATE Products SET ${setClause.join(
				", "
			)} WHERE id = $${paramIndex} RETURNING *`,
			updateParams
		);

		return res.status(200).json({
			message: PRODUCT_FEEDBACK_MESSAGES.PRODUCT_UPDATED_SUCCESS,
			data: result.rows[0],
		});
	} catch (error) {
		console.error("Error updating product:", error);
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

export {
	createProduct,
	searchProductsByName,
	getProductsByCategory,
	createCategory,
	getAllProducts,
	getProductById,
	deleteProduct,
	getCategories,
	updateProduct,
};
