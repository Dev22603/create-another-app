// /queries/cart.queries.js

export const GET_PRODUCT_NAME = `
	SELECT product_name
	FROM Products
	WHERE id = $1;
`;

export const ADD_TO_CART = `
	INSERT INTO Carts (user_id, product_id, quantity)
	VALUES ($1, $2, 1)
	ON CONFLICT (user_id, product_id)
	DO UPDATE SET quantity = Carts.quantity + 1;
`;

export const GET_USER_CART = `
	SELECT c.quantity, p.product_name, p.id AS product_id, p.images, p.sales_price as sales_price, (c.quantity * p.sales_price) AS total_price_per_item
	FROM Carts c
	JOIN Products p ON c.product_id = p.id
	WHERE c.user_id = $1;
`;
export const GET_USER_CART_ITEMS = `
SELECT 
	c.quantity,
	p.product_name,
	p.id as product_id,
	p.sales_price,
	p.stock,
	(c.quantity * p.sales_price) as total_price_per_item
FROM Carts c
JOIN Products p ON c.product_id = p.id
WHERE c.user_id = $1
`;

export const UPDATE_CART_ITEM_BY_USER_AND_PRODUCT = `
	UPDATE Carts
	SET quantity = $1
	WHERE user_id = $2 
	AND
	product_id = $3
	RETURNING product_id, quantity;
`;

export const DELETE_CART_ITEM_BY_USER_AND_PRODUCT = `
	DELETE FROM Carts
	WHERE user_id = $1 AND product_id = $2
	RETURNING product_id;
`;

export const INCREMENT_CART_ITEM_QUANTITY_BY_ID = `
	UPDATE Carts
	SET quantity = quantity + 1
	WHERE id = $1
	RETURNING id, product_id, quantity;
`;
export const CLEAR_CART_BY_USER = `
	DELETE FROM Carts
	WHERE user_id = $1;
`;



export const CHECK_CART_ITEM_QUANTITY_BY_USER_AND_PRODUCT = `
	SELECT quantity, p.product_name
	FROM Carts c
	JOIN Products p ON c.product_id = p.id
	WHERE c.user_id = $1 AND c.product_id = $2;
`;

export const GET_CART_PRODUCTS_CATEGORIES_BY_USER = `
	SELECT p.category_id, p.product_name
	FROM Carts c
	JOIN Products p ON c.product_id = p.id
	WHERE c.user_id = $1;
`;
