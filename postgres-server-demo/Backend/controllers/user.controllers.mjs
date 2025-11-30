// controllers/user.controllers.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/db.mjs";
import { userSchema } from "../utils/validators/user.validator.mjs";
import {
	CHECK_USER_EXISTS,
	GET_USER_BY_EMAIL_ID,
	GET_USERS,
	INSERT_USER,
} from "../queries/user.queries.mjs";
import {
	GLOBAL_ERROR_MESSAGES,
	USER_FEEDBACK_MESSAGES,
} from "../utils/constants/app.messages.mjs";

// better signup
const signup = async (req, res) => {
	const parsedBody = {
		name: req.body.name?.trim(),
		email: req.body.email?.trim().toLowerCase(),
		password: req.body.password?.trim(),
	};

	const { error } = userSchema.validate(parsedBody, { abortEarly: false });
	if (error) {
		const errors = error.details.map((e) => e.message);
		return res
			.status(400)
			.json({ message: "User Validation failed", errors });
	}

	try {
		// Check if a user with this email already exists
		const result = await pool.query(CHECK_USER_EXISTS, [parsedBody.email]);
		if (result.rows[0].exists) {
			return res
				.status(400)
				.json({ error: USER_FEEDBACK_MESSAGES.USER_ALREADY_EXISTS });
		}

		// Determine the role based on email
		let role = parsedBody.email.endsWith("@google.com")
			? "admin"
			: "customer";

		const hashedPassword = await bcrypt.hash(parsedBody.password, 10);

		// Insert the new user into the database
		const newUser = await pool.query(INSERT_USER, [
			parsedBody.name,
			parsedBody.email,
			hashedPassword,
			role,
		]);
		const user = newUser.rows[0];

		res.status(201).json({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
		});
	}
};

// Login controller
const login = async (req, res) => {
	const email = req.body.email?.trim().toLowerCase();
	const password = req.body.password?.trim();

	try {
		const result = await pool.query(GET_USER_BY_EMAIL_ID, [email]);
		const user = result.rows[0];
		console.log(req.body);

		if (!user) {
			return res
				.status(400)
				.json({ error: USER_FEEDBACK_MESSAGES.USER_NOT_FOUND });
		}

		const isMatch = await bcrypt.compare(password, user.password);

		if (!isMatch) {
			return res
				.status(400)
				.json({ error: USER_FEEDBACK_MESSAGES.INVALID_CREDENTIALS });
		}

		// Create JWT token
		const token = jwt.sign(
			{
				id: user.id,
				role: user.role,
				name: user.name,
			},
			process.env.JWT_SECRET,
			{
				expiresIn: "10h",
			}
		);

		return res.status(200).json({
			token: token,
			role: user.role,
			name: user.name,
		});
	} catch (error) {
		return res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
			error: error,
		});
	}
};

const getAllUsers = async (req, res) => {
	try {
		const result = await pool.query(GET_USERS);
		const users = result.rows;
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
		});
	}
};

export { signup, login, getAllUsers };
