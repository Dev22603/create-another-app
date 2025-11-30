module.exports = (config) => {
	const envImport = config.additionalFeatures.includes("env")
		? "import dotenv from 'dotenv';\ndotenv.config();\n\n"
		: "";

	return `${envImport}import express from 'express';
import cors from 'cors';
import prisma from './prisma/client.mjs';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Prisma connected successfully');
  } catch (error) {
    console.error('Prisma connection error:', error);
  }
}

testConnection();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;
};
