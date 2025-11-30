// constants/product.constants.mjs

const PRODUCT_VALIDATION_ERRORS = {
	NAME_REQUIRED: "Product name is required.",
	SALES_PRICE_REQUIRED: "Sales Price is required.",
	SALES_PRICE_INVALID: "Sales price must be a valid number",
	SALES_PRICE_MIN: "Sales price must be greater than 0",
	SALES_PRICE_GREATER_THAN_MRP: "Sales price must be less than or equal to MRP",

	MRP_REQUIRED: "MRP is required.",
	MRP_INVALID: "MRP must be a valid number",
	MRP_MIN: "MRP must be greater than 0",

	CATEGORY_ID_REQUIRED: "Category ID is required.",
	CATEGORY_ID_INVALID: "Category ID must be a valid number",
	CATEGORY_ID_MIN: "Category ID must be greater than 0",
	CATEGORY_NOT_FOUND: "Category does not exist.",

	STOCK_REQUIRED: "Stock is required.",
	STOCK_INVALID: "Stock must be a valid number",
	STOCK_MIN: "Stock cannot be less than 0",

	IMAGE_REQUIRED: "At least one image is required.",
};

const USER_VALIDATION_ERRORS = {
	NAME_REQUIRED: "Name is required.",
	NAME_MIN: "Name must be at least 2 characters.",
	NAME_MAX: "Name cant exceed 100 characters.",

	EMAIL_REQUIRED: "Email is required.",
	EMAIL_INVALID: "Email must be a valid email address.",

	PASSWORD_REQUIRED: "Password is required.",
	PASSWORD_INVALID:
		"Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character",
};

const USER_FEEDBACK_MESSAGES = {
	USER_CREATED_SUCCESS: "User created successfully",
	USER_LOGIN_SUCCESS: "User logged in successfully",
	USER_LOGOUT_SUCCESS: "User logged out successfully",
	USER_DELETED_SUCCESS: "User deleted successfully",
	USER_UPDATED_SUCCESS: "User updated successfully",
	USER_NOT_FOUND: "User not found",
	USER_ALREADY_EXISTS: "User already exists",
	USER_NOT_AUTHENTICATED: "User not authenticated",
	USER_NOT_AUTHORIZED: "User not authorized",
	INVALID_CREDENTIALS: "Invalid credentials",
};

const PRODUCT_FEEDBACK_MESSAGES = {
	NO_PRODUCTS_FOUND: "No products found.",
	NO_PRODUCT_FOUND_BY_ID: "No product found for the given product id.",
	PRODUCT_ADDED_SUCCESS: "Product added successfully",
	PRODUCT_UPDATED_SUCCESS: "Product updated successfully",
};

const ADDRESS_VALIDATION_ERRORS = {
	USER_ID_REQUIRED: "User ID is required.",
	USER_ID_INVALID: "User ID must be a valid number.",
	USER_ID_MIN: "User ID must be at least 1.",

	FULL_NAME_REQUIRED: "Full name is required.",
	FULL_NAME_MIN: "Full name must be at least 2 characters.",

	PHONE_REQUIRED: "Phone number is required.",
	PHONE_INVALID: "Phone number must be 10 digits.",

	PINCODE_REQUIRED: "Pincode is required.",
	PINCODE_INVALID: "Pincode must be a valid 6-digit code.",

	HOUSE_NUMBER_REQUIRED: "House number is required.",
	AREA_REQUIRED: "Area is required.",
	CITY_REQUIRED: "City is required.",
	STATE_REQUIRED: "State is required.",
	ADDRESS_TYPE_REQUIRED: "Address Type cant be an empty string.",
};

const GLOBAL_ERROR_MESSAGES = {
	SERVER_ERROR: "Internal Server Error. Please try again later.",
};
const CART_VALIDATION_ERRORS = {
	PRODUCT_ID_REQUIRED: "Product ID is required",
	PRODUCT_ID_INVALID: "Product ID must be a valid number",
	PRODUCT_ID_MIN: "Product ID must be a positive number",

	QUANTITY_REQUIRED: "Quantity is required",
	QUANTITY_INVALID: "Quantity must be a valid number",
	QUANTITY_MIN: "Quantity must be a non-negative number",
};

const ORDER_VALIDATION_ERRORS = {
	USER_ID_REQUIRED: "User ID is required.",
	USER_ID_INVALID: "User ID must be a valid number.",
	USER_ID_MIN: "User ID must be at least 1.",
	USER_ID_NOT_FOUND: "User not found.",

	ADDRESS_ID_REQUIRED: "Address ID is required.",
	ADDRESS_ID_INVALID: "Address ID must be a valid number.",
	ADDRESS_ID_MIN: "Address ID must be at least 1.",
	ADDRESS_ID_NOT_FOUND: "Address not found.",
	CART_EMPTY: "Cart is empty. Cannot create an order.",
};

const ORDER_FEEDBACK_MESSAGES = {
	ORDER_CREATED_SUCCESS: "Order created successfully",
	NO_ORDERS_FOUND: "No orders found.",
	ORDER_CANCELLED_SUCCESS: "Order cancelled successfully",
	ORDER_NOT_FOUND: "Order not found.",
	NO_ORDERS_FOUND_ADMIN: "No orders found.",
};

export {
	PRODUCT_VALIDATION_ERRORS,
	ORDER_VALIDATION_ERRORS,
	ORDER_FEEDBACK_MESSAGES,
	PRODUCT_FEEDBACK_MESSAGES,
	GLOBAL_ERROR_MESSAGES,
	ADDRESS_VALIDATION_ERRORS,
	USER_VALIDATION_ERRORS,
	USER_FEEDBACK_MESSAGES,
	CART_VALIDATION_ERRORS,
};
