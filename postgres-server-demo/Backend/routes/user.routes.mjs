// routes/user.routes.mjs

import express from "express";
import {
	signup,
	login,
	getAllUsers,
} from "../controllers/user.controllers.mjs";
import { authenticate, authorize } from "../middlewares/auth.mjs";

const router = express.Router();

// Sign up route
router.post("/auth/signup", signup);

// Login route
router.post("/auth/login", login);
router.get("/users", authenticate, authorize(["admin"]), getAllUsers);

export default router;
