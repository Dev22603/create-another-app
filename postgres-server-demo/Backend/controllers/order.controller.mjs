// Backend\controllers\order.controller.mjs
import { pool } from "../db/db.mjs";
import {
	GET_USER_CART_ITEMS,
	CLEAR_CART_BY_USER,
} from "../queries/cart.queries.mjs";
import {
	GET_USER_ORDERS,
	INSERT_ORDER,
	GET_ORDER_DETAILS,
	UPDATE_ORDER_STATUS,
	GET_ORDER_STATUS,
	GET_ALL_ORDERS_WITH_ITEMS,
	GET_ALL_ORDERS_COUNT,
	GET_ALL_ORDERS,
} from "../queries/order.queries.mjs";
import {
	ORDER_VALIDATION_ERRORS,
	ORDER_FEEDBACK_MESSAGES,
	GLOBAL_ERROR_MESSAGES,
} from "../utils/constants/app.messages.mjs";
import { validatePagination, formatDate } from "../utils/common_functions.mjs";
import { ORDER } from "../utils/constants/app.constants.mjs";
import { GET_USER_ID_BY_ADDRESS_ID } from "../queries/address.queries.mjs";
// Create order from cart
const createOrder = async (req, res) => {
	const user_id = req.user.id; // assuming you have user info from JWT token
	const { address_id } = req.body;
	if (!address_id) {
		return res
			.status(400)
			.json({ message: ORDER_VALIDATION_ERRORS.ADDRESS_ID_REQUIRED });
	}
	const address_user_id = await pool.query(GET_USER_ID_BY_ADDRESS_ID, [
		address_id,
	]);
	if (address_user_id.rows.length === 0) {
		return res
			.status(404)
			.json({ message: ORDER_VALIDATION_ERRORS.ADDRESS_ID_NOT_FOUND });
	}
	if (address_user_id.rows[0].user_id !== user_id) {
		return res
			.status(403)
			.json({ message: ORDER_VALIDATION_ERRORS.ADDRESS_ID_NOT_FOUND });
	}
	try {
		// Start a transaction
		await pool.query("BEGIN");

		// Get cart items and total amount in a single query
		const cartItems = await pool.query(GET_USER_CART_ITEMS, [user_id]);

		if (cartItems.rows.length === 0) {
			// If the cart is empty, rollback the transaction
			await pool.query("ROLLBACK");
			return res
				.status(400)
				.json({ message: ORDER_VALIDATION_ERRORS.CART_EMPTY });
		}

		// Check stock availability for all items
		const insufficientStock = cartItems.rows.find(
			(item) => item.stock < item.quantity
		);
		if (insufficientStock) {
			await pool.query("ROLLBACK");
			return res.status(400).json({
				message: `Insufficient stock for product: ${insufficientStock.product_name}. Available: ${insufficientStock.stock}, Required: ${insufficientStock.quantity}`,
			});
		}

		// Calculate total amount
		const total_amount = cartItems.rows.reduce(
			(sum, item) => sum + item.total_price_per_item,
			0
		);

		// Create the order
		const orderResult = await pool.query(INSERT_ORDER, [
			user_id,
			total_amount,
			address_id,
		]);
		const order_id = orderResult.rows[0].id;

		// Batch update stock levels
		for (let i = 0; i < cartItems.rows.length; i++) {
			const item = cartItems.rows[i];
			await pool.query(
				`
				UPDATE Products 
				SET stock = GREATEST(0, stock - $1) 
				WHERE id = $2 AND stock >= $1
				`,
				[item.quantity, item.product_id]
			);
		}

		// Batch insert order items
		const orderItems = cartItems.rows
			.map(
				(item) =>
					`(${order_id}, ${item.product_id}, ${item.quantity}, ${item.sales_price})`
			)
			.join(", ");
		await pool.query(`
			INSERT INTO Order_Items (order_id, product_id, quantity, price)
			VALUES ${orderItems}
		`);

		await pool.query(CLEAR_CART_BY_USER, [user_id]);

		// Commit the transaction
		await pool.query("COMMIT");

		return res.status(201).json({
			message: ORDER_FEEDBACK_MESSAGES.ORDER_CREATED_SUCCESS,
			order_id,
		});
	} catch (error) {
		// Rollback the transaction in case of an error
		await pool.query("ROLLBACK");
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error.message,
		});
	}
};

// Get user's orders
const getUserOrders = async (req, res) => {
	const user_id = req.user.id;
	const { page, limit, offset } = validatePagination(req);

	try {
		// Query to get total orders count for pagination
		const totalCountResult = await pool.query(
			`SELECT COUNT(*) FROM Orders WHERE user_id = $1`,
			[user_id]
		);
		const totalCount = parseInt(totalCountResult.rows[0].count, 10);

		// Query to fetch the user's paginated orders with order details
		const result = await pool.query(GET_USER_ORDERS, [
			user_id,
			limit,
			offset,
		]);

		// If no orders are found
		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ message: ORDER_FEEDBACK_MESSAGES.NO_ORDERS_FOUND });
		}
		/*
		// Group orders by order_id and accumulate order items under each order
		const orders = result.rows.reduce((acc, row) => {
			const existingOrder = acc.find(
				(order) => order.order_id === row.order_id
			);
			if (existingOrder) {
				existingOrder.order_items.push({
					product_id: row.product_id,
					product_name: row.product_name,
					quantity: row.quantity,
					sales_price: parseFloat(row.product_price),
				});
			} else {
				acc.push({
					order_id: row.order_id,
					user_id: row.user_id,
					total_amount: parseFloat(row.total_amount),
					created_at: new Date(row.created_at).toLocaleDateString(
						"en-GB"
					),
					order_items: [
						{
							product_id: row.product_id,
							product_name: row.product_name,
							quantity: row.quantity,
							sales_price: parseFloat(row.product_price),
						},
					],
				});
			}
			return acc;
		}, []);
		*/

		// Format the created_at date and prepare the response
		const orders = result.rows.map((row) => ({
			...row,
			created_at: formatDate(row.created_at),
		}));

		// Respond with paginated orders and metadata
		res.status(200).json({
			page,
			limit,
			total_count: totalCount,
			total_pages: Math.ceil(totalCount / limit),
			orders: orders,
		});
	} catch (error) {
		console.error("Error fetching user orders:", error);
		res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
		});
	}
};

const getOrderDetails = async (req, res) => {
	const { order_id } = req.params;

	try {
		const orderDetails = await pool.query(GET_ORDER_DETAILS, [order_id]);

		if (orderDetails.rows.length === 0) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Extract the general order details (same for all rows)
		const {
			order_id: id,
			user_id,
			total_amount,
			created_at,
		} = orderDetails.rows[0];

		// Format the created_at date as dd/mm/yyyy
		const formattedDate = formatDate(created_at);

		// Transform the data to group items under the order
		/*
		const response = {
			order_id: id,
			user_id,
			total_amount: parseFloat(total_amount),
			created_at: formattedDate,
			order_items: orderDetails.rows.map((item) => ({
				product_id: item.product_id,
				product_name: item.product_name,
				quantity: item.quantity,
				sales_price: parseFloat(item.product_price),
			})),
		};
		*/
		const response = orderDetails.rows[0];

		return res.status(200).json(response);
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error,
		});
	}
};
const cancelOrder = async (req, res) => {
	const { order_id } = req.params;

	try {
		// Check if the order exists and belongs to the user
		const orderCheck = await pool.query(GET_ORDER_STATUS, [order_id]);

		if (orderCheck.rows.length === 0) {
			return res
				.status(404)
				.json({ message: ORDER_FEEDBACK_MESSAGES.ORDER_NOT_FOUND });
		}

		const orderStatus = orderCheck.rows[0].status;

		if (orderStatus !== ORDER.STATUS.PENDING) {
			return res.status(400).json({
				message: `Cannot cancel order that is not ${ORDER.STATUS.PENDING.toLowerCase()}.`,
			});
		}

		// Update the order status to cancelled
		await pool.query(UPDATE_ORDER_STATUS, [
			ORDER.STATUS.CANCELLED,
			order_id,
		]);

		return res.status(200).json({
			message: ORDER_FEEDBACK_MESSAGES.ORDER_CANCELLED_SUCCESS,
			order_id,
		});
	} catch (error) {
		return res
			.status(500)
			.json({ message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR, error });
	}
};

const updateOrderStatus = async (req, res) => {
	const { order_id } = req.params;
	const { status } = req.body;
	console.log(order_id);
	console.log(status);

	// Check if the provided status is valid
	if (!ORDER.STATUS.values.includes(status)) {
		return res.status(400).json({
			message: `Invalid status. Allowed values are: ${ORDER.STATUS.values.join(
				", "
			)}.`,
		});
	}

	try {
		// Update the order status
		const result = await pool.query(UPDATE_ORDER_STATUS, [
			status,
			order_id,
		]);

		if (result.rows.length === 0) {
			return res.status(404).json({ message: "Order not found" });
		}

		return res.status(200).json({
			message: "Order status updated successfully",
			order: result.rows[0],
		});
	} catch (error) {
		return res
			.status(500)
			.json({ message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR, error });
	}
};

// Get All Orders (Admin Only)
const getAllOrders = async (req, res) => {
	const { page, limit, offset } = validatePagination(req);

	try {
		const result = await pool.query(GET_ALL_ORDERS, [limit, offset]);
		// OLD
		// const result = await pool.query(GET_ALL_ORDERS_WITH_ITEMS, [
		// 	limit,
		// 	offset,
		// ]);

		// Query to fetch total number of orders for pagination
		const totalCountResult = await pool.query(GET_ALL_ORDERS_COUNT);

		const totalOrders = parseInt(totalCountResult.rows[0].total_orders, 10);

		const totalPages = Math.ceil(totalOrders / limit);

		// If no orders are found
		if (result.rows.length === 0) {
			return res.status(404).json({
				message: ORDER_FEEDBACK_MESSAGES.NO_ORDERS_FOUND_ADMIN,
			});
		}
		// NEW
		const users = result.rows.map((user) => ({
			user_id: user.user_id,
			user_name: user.user_name,
			orders: user.orders?.map((order) => ({
				order_id: order.order_id,
				total_amount: order.total_amount,
				created_at: order.created_at,
				status: order.status,
				order_items: order.order_items || [],
			})),
		}));
		console.log(users);

		// OLD
		// // Group orders by user_id and then by order_id, accumulating order items under each order
		// const users = result.rows.reduce((acc, row) => {
		// 	// If the user already exists, we check for the order and add the item to it
		// 	const existingUser = acc.find(
		// 		(user) => user.user_id === row.user_id
		// 	);
		// 	if (existingUser) {
		// 		// If the order already exists, add the item to its order_items
		// 		const existingOrder = existingUser.orders.find(
		// 			(order) => order.order_id === row.order_id
		// 		);
		// 		if (existingOrder) {
		// 			existingOrder.order_items.push({
		// 				product_id: row.product_id,
		// 				product_name: row.product_name,
		// 				quantity: row.quantity,
		// 				sales_price: parseFloat(row.item_price),
		// 				total_price: parseFloat(row.item_price) * row.quantity,
		// 			});
		// 		} else {
		// 			// If the order does not exist, create a new order and add the item
		// 			existingUser.orders.push({
		// 				order_id: row.order_id,
		// 				total_amount: parseFloat(row.total_amount),
		// 				created_at: new Date(row.created_at).toLocaleDateString(
		// 					"en-GB"
		// 				),
		// 				status: row.status,
		// 				order_items: [
		// 					{
		// 						product_id: row.product_id,
		// 						product_name: row.product_name,
		// 						quantity: row.quantity,
		// 						sales_price: parseFloat(row.item_price),
		// 						total_price:
		// 							parseFloat(row.item_price) * row.quantity,
		// 					},
		// 				],
		// 			});
		// 		}
		// 	} else {
		// 		// If the user doesn't exist, create a new user entry
		// 		acc.push({
		// 			user_id: row.user_id,
		// 			user_name: row.user_name,
		// 			orders: [
		// 				{
		// 					order_id: row.order_id,
		// 					total_amount: parseFloat(row.total_amount),
		// 					created_at: new Date(
		// 						row.created_at
		// 					).toLocaleDateString("en-GB"),
		// 					status: row.status,
		// 					order_items: [
		// 						{
		// 							product_id: row.product_id,
		// 							product_name: row.product_name,
		// 							quantity: row.quantity,
		// 							sales_price: parseFloat(row.item_price),
		// 							total_price:
		// 								parseFloat(row.item_price) *
		// 								row.quantity,
		// 						},
		// 					],
		// 				},
		// 			],
		// 		});
		// 	}
		// 	return acc;
		// }, []);

		// Respond with the paginated orders grouped by user_id
		return res.status(200).json({
			page: page,
			limit: limit,
			totalOrders: totalOrders,
			totalPages: totalPages,
			users: users,
		});
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error.message,
		});
	}
};

export {
	createOrder,
	getUserOrders,
	getOrderDetails,
	cancelOrder,
	updateOrderStatus,
	getAllOrders,
};
