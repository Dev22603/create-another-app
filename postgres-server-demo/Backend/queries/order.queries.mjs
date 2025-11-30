const INSERT_ORDER = `  
    INSERT INTO Orders (user_id, total_amount, address_id) VALUES ($1, $2, $3) RETURNING id;
`;

const GET_USER_ORDERS = `
    SELECT 
        o.id AS order_id,
        o.user_id,
        o.total_amount,
        o.created_at,
        jsonb_agg(
            jsonb_build_object(
                'product_id', oi.product_id,
                'product_name', p.product_name,
                'quantity', oi.quantity,
                'sales_price', oi.price::float8,
                'total_price', (oi.quantity * oi.price)::float8
            )
        ) FILTER (WHERE oi.product_id IS NOT NULL) AS order_items
    FROM Orders o
    LEFT JOIN Order_Items oi ON o.id = oi.order_id
    LEFT JOIN Products p ON oi.product_id = p.id
    WHERE o.user_id = $1
    GROUP BY o.id, o.user_id, o.total_amount, o.created_at
    ORDER BY o.created_at DESC
    LIMIT $2 OFFSET $3;
`;

/** @deprecated */
const GET_USER_ORDERS_WITH_ITEMS = `
SELECT o.id AS order_id, o.user_id, o.total_amount, o.created_at,
oi.product_id, oi.quantity, p.product_name, oi.price AS product_price
FROM Orders o
JOIN Order_Items oi ON o.id = oi.order_id
JOIN Products p ON oi.product_id = p.id
WHERE o.user_id = $1
ORDER BY o.created_at DESC
LIMIT $2 OFFSET $3;
`;

/** @deprecated */
const GET_ORDER_DETAILS_OLD = `
SELECT o.id AS order_id, o.user_id, o.total_amount, o.created_at,
        oi.product_id, oi.quantity, p.product_name, oi.price AS product_price
 FROM Orders o
 JOIN Order_Items oi ON o.id = oi.order_id
 JOIN Products p ON oi.product_id = p.id
 WHERE o.id = $1;
`;
const GET_ORDER_DETAILS = `
SELECT 
    o.id AS order_id,
    o.user_id,
    o.total_amount::float8,
    o.created_at,
    jsonb_agg(
        jsonb_build_object(
            'product_id', oi.product_id,
            'product_name', p.product_name,
            'quantity', oi.quantity,
            'sales_price', oi.price::float8,
            'total_price', (oi.quantity * oi.price)::float8
        )
    ) FILTER (WHERE oi.product_id IS NOT NULL) AS order_items
FROM Orders o
LEFT JOIN Order_Items oi ON o.id = oi.order_id
LEFT JOIN Products p ON oi.product_id = p.id
WHERE o.id = $1
GROUP BY o.id, o.user_id, o.total_amount, o.created_at;
`;

const GET_ORDER_STATUS = `
SELECT status FROM Orders WHERE id = $1;
`;

const UPDATE_ORDER_STATUS = `
UPDATE Orders SET status = $1 WHERE id = $2 RETURNING *;
`;
const GET_ALL_ORDERS = `
SELECT 
    u.id AS user_id,
    u.name AS user_name,
    jsonb_agg(
        jsonb_build_object(
            'order_id', o.id,
            'total_amount', o.total_amount::float8,
            'created_at', o.created_at::date,
            'status', o.status,
            'order_items', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'product_id', oi.product_id,
                        'product_name', p.product_name,
                        'quantity', oi.quantity,
                        'sales_price', oi.price::float8,
                        'total_price', (oi.quantity * oi.price)::float8
                    )
                ) FILTER (WHERE oi.product_id IS NOT NULL)
                FROM Order_Items oi
                JOIN Products p ON oi.product_id = p.id
                WHERE oi.order_id = o.id
            )
        )
    ) FILTER (WHERE o.id IS NOT NULL) AS orders
FROM Users u
INNER JOIN Orders o ON u.id = o.user_id
GROUP BY u.id, u.name
ORDER BY u.name
LIMIT $1 OFFSET $2;
`;

// LEFT JOIN Orders o ON u.id = o.user_id doesnt work in this case
const GET_ALL_ORDERS_WITH_ITEMS = `
SELECT o.id AS order_id, o.user_id, o.total_amount, o.created_at, 
                    u.name AS user_name, o.status,
                    oi.product_id, oi.quantity, oi.price AS item_price, p.product_name
             FROM Orders o
             JOIN Users u ON o.user_id = u.id
             JOIN Order_Items oi ON o.id = oi.order_id
             JOIN Products p ON oi.product_id = p.id
             ORDER BY o.created_at DESC
             LIMIT $1 OFFSET $2;
`;

const GET_ALL_ORDERS_COUNT = `
SELECT COUNT(DISTINCT o.id) AS total_orders
             FROM Orders o;
`;

const INSERT_ORDER_ITEMS = `
INSERT INTO Order_Items (order_id, product_id, quantity, price)
VALUES ($1, $2, $3, $4);
`;

export {
	INSERT_ORDER,
	INSERT_ORDER_ITEMS,
	GET_USER_ORDERS,
	GET_ORDER_DETAILS,
	GET_ORDER_DETAILS_OLD,
	GET_USER_ORDERS_WITH_ITEMS,
	GET_ORDER_STATUS,
	UPDATE_ORDER_STATUS,
	GET_ALL_ORDERS,
	GET_ALL_ORDERS_WITH_ITEMS,
	GET_ALL_ORDERS_COUNT,
};
