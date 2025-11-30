module.exports = () => {
	return `import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = \`\${process.env.MONGODB_URI}\${process.env.DB_NAME}\`;
    const conn = await mongoose.connect(mongoURI);
    console.log(\`MongoDB connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`MongoDB connection error: \${error.message}\`);
    process.exit(1);
  }
};
`;
};
