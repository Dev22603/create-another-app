module.exports = (config) => {
	const envImport = config.additionalFeatures.includes("env")
		? "import dotenv from 'dotenv';\ndotenv.config();\n\n"
		: "";

	return `${envImport}import express from 'express';
import cors from 'cors';
import { connectDB } from './db/database.mjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
await connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;
};
