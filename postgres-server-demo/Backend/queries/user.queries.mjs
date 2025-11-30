// /queries/user.queries.js
const INSERT_USER = `INSERT INTO Users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`;

const CHECK_USER_EXISTS = `SELECT EXISTS(SELECT 1 FROM Users WHERE email = $1) AS "exists"`;

const GET_USER_BY_EMAIL_ID = `SELECT * FROM Users WHERE email = $1`;

const GET_USERS = `SELECT * FROM Users`;

const UPDATE_USER = `UPDATE Users SET name = $2, email = $3, role = $4 WHERE id = $1 RETURNING id, name, email, role`;

const DELETE_USER = `DELETE FROM Users WHERE id = $1 RETURNING id, name, email, role`;

export {
    INSERT_USER,
    CHECK_USER_EXISTS,
    GET_USER_BY_EMAIL_ID ,
    GET_USERS,
    UPDATE_USER,
    DELETE_USER,
};
