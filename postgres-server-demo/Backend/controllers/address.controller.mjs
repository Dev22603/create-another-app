import { pool } from "../db/db.mjs";
import {
	INSERT_ADDRESS,
	GET_ALL_ADDRESSES_BY_USER,
	UPDATE_ADDRESS,
	CHECK_ADDRESS_USED_IN_ORDERS,
	SOFT_DELETE_ADDRESS,
	HARD_DELETE_ADDRESS,
	SET_DEFAULT_ADDRESS,
} from "../queries/address.queries.mjs";
import { GLOBAL_ERROR_MESSAGES } from "../utils/constants/app.messages.mjs";
import { addressSchema } from "../utils/validators/address.validator.mjs";

// CREATE - Add new address
const createAddress = async (req, res) => {
	try {
		const {
			full_name,
			phone,
			pincode,
			house_number,
			area,
			landmark,
			city,
			state,
			address_type = "Home",
		} = req.body;
		const user_id = req.user.id;

		const parsedBody = {
			full_name: full_name?.trim(),
			phone: phone?.trim(),
			pincode: pincode?.trim(),
			house_number: house_number?.trim(),
			area: area?.trim(),
			landmark: landmark?.trim(),
			city: city?.trim(),
			state: state?.trim(),
			address_type: address_type?.trim() || "Home",
		};

		const { error } = addressSchema.validate(parsedBody, {
			abortEarly: false,
		});
		if (error) {
			const errors = error.details.map((e) => e.message);
			return res
				.status(400)
				.json({ message: "Validation failed", errors });
		}

		const { rows } = await pool.query(INSERT_ADDRESS, [
			user_id,
			full_name,
			phone,
			pincode,
			house_number,
			area,
			landmark,
			city,
			state,
			address_type,
		]);

		return res.status(201).json({ success: true, address: rows[0] });
	} catch (err) {
		console.error("Error creating address:", err);
		return res.status(500).json({
			success: false,
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
		});
	}
};

// READ - Get all addresses for a user
const getAddressesByUser = async (req, res) => {
	try {
		const userId = req.user.id;
		const { rows } = await pool.query(GET_ALL_ADDRESSES_BY_USER, [userId]);

		res.status(200).json({ success: true, addresses: rows });
	} catch (err) {
		console.error("Error fetching addresses:", err);
		res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};

// UPDATE - Update an address by ID
const updateAddress = async (req, res) => {
	try {
		const addressId = req.params.id;
		const {
			full_name,
			phone,
			pincode,
			house_number,
			area,
			landmark,
			city,
			state,
			address_type,
		} = req.body;

		const { rows } = await pool.query(UPDATE_ADDRESS, [
			addressId,
			full_name,
			phone,
			pincode,
			house_number,
			area,
			landmark,
			city,
			state,
			address_type,
		]);

		if (rows.length === 0) {
			return res.status(404).json({
				success: false,
				error: "Address not found or already deleted",
			});
		}

		res.status(200).json({ success: true, address: rows[0] });
	} catch (err) {
		console.error("Error updating address:", err);
		res.status(500).json({
			success: false,
			error: "Internal server error",
		});
	}
};

// DELETE - Smart delete (soft if used, hard if not)
const deleteAddress = async (req, res) => {
	try {
		const addressId = req.params.id;
		const userId = req.user.id;

		// Optional: Check if the address belongs to the user
		const { rows: userAddresses } = await pool.query(
			GET_ALL_ADDRESSES_BY_USER,
			[userId]
		);
		const validAddress = userAddresses.find(
			(addr) => addr.id === parseInt(addressId)
		);
		if (!validAddress) {
			return res.status(404).json({
				success: false,
				error: "Address not found for this user",
			});
		}
		// Check if address is used in orders
		const { rows } = await pool.query(CHECK_ADDRESS_USED_IN_ORDERS, [
			addressId,
		]);
		const isUsed = rows[0].exists;

		if (isUsed) {
			await pool.query(SOFT_DELETE_ADDRESS, [addressId]);
			return res.status(200).json({
				success: true,
				message: "Address soft deleted (in use)",
			});
		} else {
			await pool.query(HARD_DELETE_ADDRESS, [addressId]);
			return res.status(200).json({
				success: true,
				message: "Address permanently deleted",
			});
		}
	} catch (err) {
		console.error("Error deleting address:", err);
		res.status(500).json({
			success: false,
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
		});
	}
};

const setDefaultAddress = async (req, res) => {
	try {
		const userId = req.user.id;
		const addressId = req.params.id;

		// Optional: Check if the address belongs to the user
		const { rows } = await pool.query(GET_ALL_ADDRESSES_BY_USER, [userId]);
		const validAddress = rows.find(
			(addr) => addr.id === parseInt(addressId)
		);
		if (!validAddress) {
			return res.status(404).json({
				success: false,
				error: "Address not found for this user",
			});
		}

		await pool.query(SET_DEFAULT_ADDRESS, [userId, addressId]);

		return res.status(200).json({
			success: true,
			message: "Default address updated successfully",
		});
	} catch (err) {
		console.error("Error setting default address:", err);
		res.status(500).json({
			success: false,
			message: GLOBAL_ERROR_MESSAGES.SERVER_ERROR,
		});
	}
};

export {
	getAddressesByUser,
	createAddress,
	updateAddress,
	deleteAddress,
	setDefaultAddress,
};
