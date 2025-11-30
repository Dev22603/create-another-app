const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");
const ora = require("ora");

async function scaffold(projectName, config) {
	const projectPath = path.resolve(process.cwd(), projectName);

	// Create project directory
	await fs.ensureDir(projectPath);

	// Setup frontend
	if (
		config.projectType === "fullstack" ||
		config.projectType === "frontend"
	) {
		await setupFrontend(projectPath, config);
	}

	// Setup backend
	if (
		config.projectType === "fullstack" ||
		config.projectType === "backend"
	) {
		await setupBackend(projectPath, config);
	}

	// Setup additional features
	if (config.additionalFeatures.length > 0) {
		await setupAdditionalFeatures(projectPath, config);
	}

	// Install dependencies
	if (config.installDependencies) {
		await installDependencies(projectPath, config);
	}

	// Generate README
	await generateReadme(projectPath, config);
}

async function setupFrontend(projectPath, config) {
	const spinner = ora("Setting up frontend...").start();

	const frontendPath =
		config.projectType === "fullstack"
			? path.join(projectPath, "frontend")
			: projectPath;

	try {
		const isNextJS = config.frontendFramework.startsWith("nextjs");

		if (isNextJS) {
			// Create Next.js app
			const useTypeScript = config.frontendFramework === "nextjs-ts";
			const tailwindFlag = config.includeTailwind ? "--tailwind" : "--no-tailwind";
			const tsFlag = useTypeScript ? "--ts" : "--js";

			execSync(
				`npx create-next-app@latest ${path.basename(frontendPath)} ${tsFlag} ${tailwindFlag} --eslint --app --no-src-dir --import-alias "@/*"`,
				{
					cwd: path.dirname(frontendPath),
					stdio: "pipe",
				}
			);
		} else {
			// Create React app with Vite
			execSync(
				`npm create vite@latest ${path.basename(
					frontendPath
				)} -- --template ${config.frontendFramework}`,
				{
					cwd: path.dirname(frontendPath),
					stdio: "pipe",
				}
			);

			// Setup Tailwind if requested for Vite projects
			if (config.includeTailwind) {
				await setupTailwind(frontendPath);
			}
		}

		spinner.succeed("Frontend setup complete");
	} catch (error) {
		spinner.fail("Frontend setup failed");
		throw error;
	}
}

async function setupBackend(projectPath, config) {
	const spinner = ora("Setting up backend...").start();

	const backendPath =
		config.projectType === "fullstack"
			? path.join(projectPath, "backend")
			: projectPath;

	try {
		await fs.ensureDir(backendPath);

		// Create package.json
		const packageJson = {
			name:
				config.projectType === "fullstack"
					? `${path.basename(projectPath)}-backend`
					: path.basename(projectPath),
			version: "1.0.0",
			description: "",
			main: config.backendTemplate.includes("ts")
				? "dist/server.js"
				: "server.js",
			scripts: {
				start: config.backendTemplate.includes("ts")
					? "node dist/server.js"
					: "node server.js",
				dev: config.backendTemplate.includes("ts")
					? "tsx watch src/server.ts"
					: "nodemon server.js",
				...(config.backendTemplate.includes("ts") && { build: "tsc" }),
			},
			dependencies: {
				express: "^4.18.2",
				cors: "^2.8.5",
				...(config.additionalFeatures.includes("env") && {
					dotenv: "^16.3.1",
				}),
				...(config.additionalFeatures.includes("mongodb") && {
					mongoose: "^7.5.0",
				}),
			},
			devDependencies: {
				nodemon: "^3.0.1",
				...(config.backendTemplate.includes("ts") && {
					"@types/express": "^4.17.17",
					"@types/cors": "^2.8.13",
					typescript: "^5.2.2",
					tsx: "^3.12.8",
				}),
			},
		};

		await fs.writeJson(
			path.join(backendPath, "package.json"),
			packageJson,
			{ spaces: 2 }
		);

		// Create folder structure
		const folders = [
			"routes",
			"controllers",
			"models",
			"middleware",
			"utils",
		];
		if (config.backendTemplate.includes("ts")) {
			folders.push("src");
			await Promise.all(
				folders.map((folder) =>
					fs.ensureDir(
						path.join(
							backendPath,
							folder === "src" ? folder : `src/${folder}`
						)
					)
				)
			);
		} else {
			await Promise.all(
				folders.map((folder) =>
					fs.ensureDir(path.join(backendPath, folder))
				)
			);
		}

		// Create server file
		await createServerFile(backendPath, config);

		spinner.succeed("Backend setup complete");
	} catch (error) {
		spinner.fail("Backend setup failed");
		throw error;
	}
}

async function setupTailwind(frontendPath) {
	const spinner = ora("Setting up Tailwind CSS...").start();

	try {
		// Install Tailwind
		execSync("npm install -D tailwindcss postcss autoprefixer", {
			cwd: frontendPath,
			stdio: "pipe",
		});

		// Initialize Tailwind
		execSync("npx tailwindcss init -p", {
			cwd: frontendPath,
			stdio: "pipe",
		});

		// Update tailwind.config.js
		const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;

		await fs.writeFile(
			path.join(frontendPath, "tailwind.config.js"),
			tailwindConfig
		);

		// Add Tailwind to CSS
		const cssPath = path.join(frontendPath, "src/index.css");
		const tailwindImports = `@tailwind base;
@tailwind components;
@tailwind utilities;

`;

		if (await fs.pathExists(cssPath)) {
			const existingCss = await fs.readFile(cssPath, "utf8");
			await fs.writeFile(cssPath, tailwindImports + existingCss);
		} else {
			await fs.writeFile(cssPath, tailwindImports);
		}

		spinner.succeed("Tailwind CSS setup complete");
	} catch (error) {
		spinner.fail("Tailwind CSS setup failed");
		throw error;
	}
}

async function createServerFile(backendPath, config) {
	const isTypeScript = config.backendTemplate.includes("ts");
	const serverPath = isTypeScript
		? path.join(backendPath, "src/server.ts")
		: path.join(backendPath, "server.js");

	const serverContent = `${
		config.additionalFeatures.includes("env")
			? "require('dotenv').config();\n"
			: ""
	}
const express = require('express');
const cors = require('cors');
${
	config.additionalFeatures.includes("mongodb")
		? "const mongoose = require('mongoose');\n"
		: ""
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

${
	config.additionalFeatures.includes("mongodb")
		? `
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
`
		: ""
}

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

	await fs.writeFile(serverPath, serverContent);

	// Create TypeScript config if needed
	if (isTypeScript) {
		const tsConfig = {
			compilerOptions: {
				target: "es2020",
				module: "commonjs",
				outDir: "./dist",
				rootDir: "./src",
				strict: true,
				esModuleInterop: true,
				skipLibCheck: true,
				forceConsistentCasingInFileNames: true,
			},
			include: ["src/**/*"],
			exclude: ["node_modules"],
		};

		await fs.writeJson(path.join(backendPath, "tsconfig.json"), tsConfig, {
			spaces: 2,
		});
	}
}

async function setupAdditionalFeatures(projectPath, config) {
	const spinner = ora("Setting up additional features...").start();

	try {
		// Environment variables
		if (config.additionalFeatures.includes("env")) {
			const envContent = `# Environment Variables
NODE_ENV=development
PORT=5000
${
	config.additionalFeatures.includes("mongodb")
		? "MONGODB_URI=mongodb://localhost:27017/myapp\n"
		: ""
}
${
	config.additionalFeatures.includes("auth")
		? "JWT_SECRET=your-super-secret-jwt-key\n"
		: ""
}`;

			const envPath =
				config.projectType === "fullstack"
					? path.join(projectPath, "backend/.env.example")
					: path.join(projectPath, ".env.example");

			await fs.writeFile(envPath, envContent);
		}

		spinner.succeed("Additional features setup complete");
	} catch (error) {
		spinner.fail("Additional features setup failed");
		throw error;
	}
}

async function installDependencies(projectPath, config) {
	const spinner = ora("Installing dependencies...").start();

	try {
		if (config.projectType === "fullstack") {
			// Install frontend dependencies
			execSync("npm install", {
				cwd: path.join(projectPath, "frontend"),
				stdio: "pipe",
			});

			// Install backend dependencies
			execSync("npm install", {
				cwd: path.join(projectPath, "backend"),
				stdio: "pipe",
			});
		} else {
			// Install dependencies for single project
			execSync("npm install", {
				cwd: projectPath,
				stdio: "pipe",
			});
		}

		spinner.succeed("Dependencies installed successfully");
	} catch (error) {
		spinner.fail("Dependency installation failed");
		throw error;
	}
}

async function generateReadme(projectPath, config) {
	const readmeContent = `# ${path.basename(projectPath)}

${
	config.projectType === "fullstack"
		? "A full stack"
		: config.projectType === "frontend"
		? "A frontend"
		: "A backend"
} application scaffolded with create-fullstack-app.

## Getting Started

${
	config.projectType === "fullstack"
		? `
### Frontend
\`\`\`bash
cd frontend
npm run dev
\`\`\`

### Backend
\`\`\`bash
cd backend
npm run dev
\`\`\`
`
		: `
\`\`\`bash
npm run dev
\`\`\`
`
}

## Features

${
	config.projectType !== "backend"
		? `- ⚛️ ${
				config.frontendFramework.startsWith("nextjs")
					? config.frontendFramework === "nextjs-ts"
						? "Next.js with TypeScript"
						: "Next.js"
					: config.frontendFramework === "react-ts"
					? "React with TypeScript (Vite)"
					: "React (Vite)"
		  }\n`
		: ""
}${config.includeTailwind ? "- 🎨 Tailwind CSS for styling\n" : ""}${
		config.projectType !== "frontend"
			? `- 🚀 Express.js backend${
					config.backendTemplate.includes("ts")
						? " with TypeScript"
						: ""
			  }\n`
			: ""
	}${
		config.additionalFeatures.includes("mongodb")
			? "- 🗄️ MongoDB integration\n"
			: ""
	}${
		config.additionalFeatures.includes("env")
			? "- 🔧 Environment variables setup\n"
			: ""
	}

## License

MIT
`;

	await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
}

module.exports = { scaffold };
