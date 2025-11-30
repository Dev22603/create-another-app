module.exports = (database) => {
	if (database === 'postgresql') {
		return `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/db.mjs';
import {
  CHECK_USER_EXISTS,
  GET_USER_BY_EMAIL_ID,
  GET_USERS,
  INSERT_USER,
} from '../queries/user.queries.mjs';

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const result = await pool.query(CHECK_USER_EXISTS, [email]);
    if (result.rows[0].exists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Determine role (you can customize this logic)
    const role = email.endsWith('@admin.com') ? 'admin' : 'customer';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await pool.query(INSERT_USER, [
      name,
      email,
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
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(GET_USER_BY_EMAIL_ID, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
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
        expiresIn: '10h',
      }
    );

    return res.status(200).json({
      token: token,
      role: user.role,
      name: user.name,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
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
    res.status(500).json({ message: 'Server error' });
  }
};

export { signup, login, getAllUsers };
`;
	} else {
		return `import User from '../models/user.model.mjs';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const userResponse = user.toObject();
    delete userResponse.password;
    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
	}
};
