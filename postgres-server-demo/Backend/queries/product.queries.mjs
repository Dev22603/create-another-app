// /queries/product.queries.js
const INSERT_PRODUCT = `
  INSERT INTO Products (
	product_name,
	sales_price,
	mrp,
	images,
	category_id,
	stock
  )
  VALUES ($1, $2, $3, $4, $5, $6)
  RETURNING *;
`;

const CHECK_CATEGORY_EXISTS = `
  SELECT EXISTS(SELECT 1 FROM Categories WHERE category_name = $1) AS "exists";
`;

const SEARCH_PRODUCTS_BY_NAME = `
  SELECT * FROM Products
  WHERE product_name ILIKE $1
  LIMIT $2 OFFSET $3;
`;

const COUNT_PRODUCTS_BY_NAME = `
  SELECT COUNT(*) FROM Products
  WHERE product_name ILIKE $1;
`;

const GET_PRODUCT_STOCK = `
  SELECT stock FROM Products
  WHERE id = $1;
`;

const GET_PRODUCTS_BY_CATEGORY = `
  SELECT * FROM Products
  WHERE category_id = $1
  LIMIT $2 OFFSET $3;
`;

const COUNT_PRODUCTS_BY_CATEGORY = `
  SELECT COUNT(*) FROM Products
  WHERE category_id = $1;
`;

const INSERT_CATEGORY = `
  INSERT INTO Categories (category_name)
  VALUES ($1)
  RETURNING *;
`;

const COUNT_PRODUCTS = `
  SELECT COUNT(*) FROM Products;
`;

const GET_PRODUCTS_PAGINATION = `
  SELECT * FROM Products
  LIMIT $1 OFFSET $2;
`;

const GET_PRODUCT_BY_ID = `
  SELECT * FROM Products
  WHERE id = $1;
`;

const GET_CATEGORIES = `
  SELECT * FROM Categories;
`;

const DELETE_PRODUCT = `
  DELETE FROM Products
  WHERE id = $1
  RETURNING *;
`;

export {
	GET_PRODUCTS_PAGINATION,
	INSERT_CATEGORY,
	CHECK_CATEGORY_EXISTS,
	INSERT_PRODUCT,
	COUNT_PRODUCTS_BY_NAME,
	SEARCH_PRODUCTS_BY_NAME,
	GET_PRODUCT_STOCK,
	GET_PRODUCTS_BY_CATEGORY,
	COUNT_PRODUCTS_BY_CATEGORY,
	COUNT_PRODUCTS,
	GET_PRODUCT_BY_ID,
	GET_CATEGORIES,
	DELETE_PRODUCT,
};
