// Backend\controllers\cart.controllers.mjs
import { pool } from "../db/db.mjs";
import {
	ADD_TO_CART,
	GET_USER_CART,
	UPDATE_CART_ITEM_BY_USER_AND_PRODUCT,
	DELETE_CART_ITEM_BY_USER_AND_PRODUCT,
	GET_PRODUCT_NAME,
	CLEAR_CART_BY_USER,
} from "../queries/cart.queries.mjs";
import { GET_PRODUCT_STOCK } from "../queries/product.queries.mjs";
import { GLOBAL_ERROR_MESSAGES } from "../utils/constants/app.messages.mjs";

// Add to Cart inspired by Amazon
const addItemToCart = async (req, res) => {
	const { product_id } = req.body; // Only product_id is provided in the request
	const user_id = req.user.id;

	try {
		const productStock = await pool.query(GET_PRODUCT_STOCK, [product_id]);
		if (!productStock.rows[0]) {
			return res.status(404).json({
				message: "Product not available",
			});
		}
		const stockAvailable = productStock.rows[0].stock;
		if (stockAvailable === 0) {
			return res.status(400).json({
				message: "Product is out of stock",
			});
		}
		await pool.query(ADD_TO_CART, [user_id, product_id]);
		res.status(200).json({
			message: "Product added to cart successfully",
		});
	} catch (error) {
		res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

const getCart = async (req, res) => {
	const user_id = req.user.id; // assuming you have user info from JWT token

	try {
		const cart = await pool.query(GET_USER_CART, [user_id]);

		// this is less efficient
		// const total_amount = cart.rows.reduce(
		// 	(sum, item) => sum + item.total_price_per_item,
		// 	0
		// );
		// const total_quantity = cart.rows.reduce(
		// 	(sum, item) => sum + item.quantity,
		// 	0
		// );

		const { total_amount, total_quantity } = cart.rows.reduce(
			(accum, item) => ({
				total_amount: accum.total_amount + item.total_price_per_item,
				total_quantity: accum.total_quantity + item.quantity,
			}),
			{ total_amount: 0, total_quantity: 0 }
		);
		return res.status(200).json({
			items: cart.rows,
			total_amount,
			total_quantity,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error,
		});
	}
};

// Update cart item
const updateCart = async (req, res) => {
	try {
		const { product_id, quantity } = req.body;
		const user_id = req.user.id;

		const productStock = await pool.query(GET_PRODUCT_STOCK, [product_id]);
		if (!productStock.rows[0]) {
			return res.status(404).json({
				message: "Product not available",
			});
		}
		const stockAvailable = productStock.rows[0].stock;

		if (stockAvailable === 0) {
			return res.status(400).json({
				message: "Product is out of stock",
			});
		} else if (stockAvailable < quantity) {
			return res.status(400).json({
				message: "Not enough stock available",
				stock_available: stockAvailable,
			});
		}

		if (quantity === 0) {
			try {
				const deleteResult = await pool.query(
					DELETE_CART_ITEM_BY_USER_AND_PRODUCT,
					[user_id, product_id]
				);

				if (deleteResult.rows.length === 0) {
					return res.status(404).json({
						success: false,
						message: "Product not found in the cart",
					});
				}

				const productResult = await pool.query(GET_PRODUCT_NAME, [
					product_id,
				]);

				return res.status(200).json({
					success: true,
					message: `${productResult.rows[0].product_name} has been removed from your cart.`,
				});
			} catch (error) {
				console.error("Error removing item from cart:", error);
				return res.status(500).json({
					success: false,
					message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
					error: error.message,
				});
			}
		}

		const updateResult = await pool.query(
			UPDATE_CART_ITEM_BY_USER_AND_PRODUCT,
			[quantity, user_id, product_id]
		);

		// Check if the item exists in the cart
		if (updateResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message:
					"Cart item not found. The product may not be in your cart.",
			});
		}

		// Get the updated cart item
		const updatedItem = updateResult.rows[0];

		// Fetch the product details
		const productResult = await pool.query(GET_PRODUCT_NAME, [product_id]);

		if (productResult.rows.length === 0) {
			return res.status(404).json({
				success: false,
				message: "Product not found",
			});
		}

		// Construct and return the response
		return res.status(200).json({
			success: true,
			message: "Cart updated successfully",
			data: {
				id: updatedItem.id,
				product_id: updatedItem.product_id,
				quantity: updatedItem.quantity,
				product_name: productResult.rows[0].product_name,
			},
		});
	} catch (error) {
		console.error("Error updating cart item:", error);
		return res.status(500).json({
			success: false,
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error.message,
		});
	}
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
	const { product_id } = req.params;
	const user_id = req.user.id;

	try {
		if (isNaN(product_id)) {
			return res.status(400).json({
				error: "product_id is an integer",
			});
		}
		if (isNaN(user_id)) {
			return res.status(400).json({
				error: "user_id is an integer",
			});
		}
		// Delete the product from the cart
		const deleteResult = await pool.query(
			DELETE_CART_ITEM_BY_USER_AND_PRODUCT,
			[user_id, product_id]
		);

		if (deleteResult.rows.length === 0) {
			// If no rows were deleted, the product wasn't in the cart
			return res.status(404).json({
				success: false,
				message: "Product not found in the cart",
			});
		}

		// Fetch the product name for the response
		const productResult = await pool.query(
			"SELECT product_name FROM Products WHERE id = $1",
			[product_id]
		);

		// Return a successful response with the product name
		return res.status(200).json({
			message: `${productResult.rows[0].product_name} has been removed from your cart.`,
		});
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error,
		});
	}
};

// Clear all items from the user's cart
const clearCart = async (req, res) => {
	const user_id = req.user.id;
	try {
		if (isNaN(user_id)) {
			return res.status(400).json({
				error: "user_id is an integer",
			});
		}
		await pool.query(CLEAR_CART_BY_USER, [user_id]);
		return res.status(200).json({ message: "Cart has been cleared." });
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error,
		});
	}
};

export { getCart, updateCart, removeItemFromCart, addItemToCart, clearCart };
