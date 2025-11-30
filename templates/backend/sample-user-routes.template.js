module.exports = () => {
	return `import express from 'express';
import {
  signup,
  login,
  getAllUsers,
} from '../controllers/user.controller.mjs';

const router = express.Router();

// Auth routes
router.post('/auth/signup', signup);
router.post('/auth/login', login);

// User routes
router.get('/users', getAllUsers);

export default router;
`;
};
