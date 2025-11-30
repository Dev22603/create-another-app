// /queries/address.queries.js
const INSERT_ADDRESS = `
  INSERT INTO Addresses (
    user_id, full_name, phone, pincode, house_number,
    area, landmark, city, state, address_type
  )
  VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10
  )
  RETURNING *;
`;

const GET_ALL_ADDRESSES_BY_USER = `
  SELECT * FROM Addresses
  WHERE user_id = $1 AND is_deleted = FALSE
  ORDER BY created_at DESC;
`;

const GET_USER_ID_BY_ADDRESS_ID = `
 SELECT user_id FROM Addresses WHERE id = $1;
`;

const UPDATE_ADDRESS = `
  UPDATE Addresses
  SET full_name = $2,
      phone = $3,
      pincode = $4,
      house_number = $5,
      area = $6,
      landmark = $7,
      city = $8,
      state = $9,
      address_type = $10
  WHERE id = $1 AND is_deleted = FALSE
  RETURNING *;
`;
const CHECK_ADDRESS_USED_IN_ORDERS = `
  SELECT EXISTS (
    SELECT 1 FROM Orders WHERE address_id = $1
  );
`;

const SOFT_DELETE_ADDRESS = `
  UPDATE Addresses
  SET is_deleted = TRUE
  WHERE id = $1;
`;

const HARD_DELETE_ADDRESS = `
  DELETE FROM Addresses
  WHERE id = $1;
`;
const SET_DEFAULT_ADDRESS = `
  UPDATE Addresses
  SET is_default = CASE
    WHEN id = $2 THEN TRUE
    ELSE FALSE
  END
  WHERE user_id = $1;
`;

export {
	INSERT_ADDRESS,
	GET_ALL_ADDRESSES_BY_USER,
	UPDATE_ADDRESS,
	CHECK_ADDRESS_USED_IN_ORDERS,
	SOFT_DELETE_ADDRESS,
	HARD_DELETE_ADDRESS,
	SET_DEFAULT_ADDRESS,
	GET_USER_ID_BY_ADDRESS_ID,
};
