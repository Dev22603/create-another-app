// routes/address.routes.js

import express from "express";
import {
	createAddress,
	getAddressesByUser,
	updateAddress,
	deleteAddress,
	setDefaultAddress,
} from "../controllers/address.controller.mjs";
import { authenticate, authorize } from "../middlewares/auth.mjs"; // assuming you're using JWT

const router = express.Router();

router.post("/", authenticate, createAddress);
router.get("/", authenticate, getAddressesByUser);
router.put("/:id", authenticate, updateAddress);
router.delete("/:id", authenticate, deleteAddress);
router.put("/:id/default", authenticate, setDefaultAddress);
export default router;
