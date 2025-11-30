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

		// Create package.json with database-specific dependencies
		const packageJson = createPackageJson(projectPath, config);
		await fs.writeJson(
			path.join(backendPath, "package.json"),
			packageJson,
			{ spaces: 2 }
		);

		// Create folder structure based on database choice
		await createBackendFolders(backendPath, config);

		// Create server file
		await createServerFile(backendPath, config);

		// Create database connection file
		if (config.database && config.database !== "none") {
			await createDatabaseFiles(backendPath, config);
		}

		// Create sample files
		await createSampleFiles(backendPath, config);

		spinner.succeed("Backend setup complete");
	} catch (error) {
		spinner.fail("Backend setup failed");
		throw error;
	}
}

function createPackageJson(projectPath, config) {
	const dependencies = {
		express: "^4.18.2",
		cors: "^2.8.5",
	};

	if (config.additionalFeatures.includes("env") || config.database !== "none") {
		dependencies.dotenv = "^16.3.1";
	}

	if (config.database === "mongodb") {
		dependencies.mongoose = "^8.0.3";
	} else if (config.database === "postgresql") {
		dependencies.pg = "^8.11.3";
		dependencies.bcryptjs = "^2.4.3";
		dependencies.jsonwebtoken = "^9.0.2";
	}

	const devDependencies = {
		nodemon: "^3.0.1",
	};

	if (config.backendTemplate.includes("ts")) {
		devDependencies["@types/express"] = "^4.17.17";
		devDependencies["@types/cors"] = "^2.8.13";
		devDependencies["@types/node"] = "^20.10.6";
		devDependencies.typescript = "^5.3.3";
		devDependencies.tsx = "^4.7.0";

		if (config.database === "postgresql") {
			devDependencies["@types/pg"] = "^8.10.9";
		}
	}

	return {
		name:
			config.projectType === "fullstack"
				? `${path.basename(projectPath)}-backend`
				: path.basename(projectPath),
		version: "1.0.0",
		description: "",
		type: "module",
		main: config.backendTemplate.includes("ts")
			? "dist/index.js"
			: "index.mjs",
		scripts: {
			start: config.backendTemplate.includes("ts")
				? "node dist/index.js"
				: "node index.mjs",
			dev: config.backendTemplate.includes("ts")
				? "tsx watch src/index.mts"
				: "nodemon index.mjs",
			...(config.backendTemplate.includes("ts") && { build: "tsc" }),
		},
		dependencies,
		devDependencies,
	};
}

async function createBackendFolders(backendPath, config) {
	let folders = ["routes", "controllers", "middleware", "utils"];

	// Add database-specific folders
	if (config.database === "postgresql") {
		folders.push("queries", "db");
	} else if (config.database === "mongodb") {
		folders.push("models", "db");
	}

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
}

async function setupTailwind(frontendPath) {
	const spinner = ora("Setting up Tailwind CSS...").start();

	try {
		// Add Tailwind v4 dependencies to package.json
		const packageJsonPath = path.join(frontendPath, "package.json");
		const packageJson = await fs.readJson(packageJsonPath);

		if (!packageJson.devDependencies) {
			packageJson.devDependencies = {};
		}

		// Install Tailwind CSS v4.1 with Vite plugin
		packageJson.devDependencies.tailwindcss = "^4.1.0";
		packageJson.devDependencies["@tailwindcss/vite"] = "^4.1.0";

		await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

		// Update vite.config to include @tailwindcss/vite plugin
		const viteConfigPath = path.join(frontendPath, "vite.config.js");
		const viteConfigTs = path.join(frontendPath, "vite.config.ts");
		const configPath = (await fs.pathExists(viteConfigTs))
			? viteConfigTs
			: viteConfigPath;

		if (await fs.pathExists(configPath)) {
			let viteConfig = await fs.readFile(configPath, "utf8");

			// Add @tailwindcss/vite import if not present
			if (!viteConfig.includes("@tailwindcss/vite")) {
				// Find the import section and add the tailwindcss import
				const importMatch = viteConfig.match(
					/(import\s+{[^}]+}\s+from\s+['"]vite['"])/
				);
				if (importMatch) {
					viteConfig = viteConfig.replace(
						importMatch[0],
						`${importMatch[0]}\nimport tailwindcss from '@tailwindcss/vite'`
					);
				}

				// Add tailwindcss() to plugins array
				viteConfig = viteConfig.replace(
					/plugins:\s*\[/,
					"plugins: [\n    tailwindcss(),"
				);
			}

			await fs.writeFile(configPath, viteConfig);
		}

		// Add @import "tailwindcss" to CSS (Tailwind v4 syntax)
		const cssPath = path.join(frontendPath, "src/index.css");
		const tailwindImport = `@import "tailwindcss";\n\n`;

		if (await fs.pathExists(cssPath)) {
			const existingCss = await fs.readFile(cssPath, "utf8");
			// Only add if not already present
			if (!existingCss.includes('@import "tailwindcss"')) {
				await fs.writeFile(cssPath, tailwindImport + existingCss);
			}
		} else {
			await fs.writeFile(cssPath, tailwindImport);
		}

		spinner.succeed("Tailwind CSS setup complete");
	} catch (error) {
		spinner.fail("Tailwind CSS setup failed");
		throw error;
	}
}

async function createServerFile(backendPath, config) {
	const isTypeScript = config.backendTemplate.includes("ts");
	const ext = isTypeScript ? ".mts" : ".mjs";
	const serverPath = isTypeScript
		? path.join(backendPath, `src/index${ext}`)
		: path.join(backendPath, `index${ext}`);

	// Load template based on database choice
	let serverTemplate;
	if (config.database === "postgresql") {
		serverTemplate = require(path.join(
			__dirname,
			"../templates/backend/postgresql-server.template.js"
		));
	} else if (config.database === "mongodb") {
		serverTemplate = require(path.join(
			__dirname,
			"../templates/backend/mongodb-server.template.js"
		));
	} else {
		// No database template
		const envImport = config.additionalFeatures.includes("env")
			? "import dotenv from 'dotenv';\ndotenv.config();\n\n"
			: "";
		serverTemplate = () => `${envImport}import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
	}

	await fs.writeFile(serverPath, serverTemplate(config));

	// Create TypeScript config if needed
	if (isTypeScript) {
		const tsConfig = {
			compilerOptions: {
				target: "ES2020",
				module: "NodeNext",
				moduleResolution: "NodeNext",
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

async function createDatabaseFiles(backendPath, config) {
	const isTypeScript = config.backendTemplate.includes("ts");
	const ext = isTypeScript ? ".mts" : ".mjs";
	const dbDir = isTypeScript ? "src/db" : "db";
	const dbPath = path.join(backendPath, dbDir);

	let dbTemplate;
	let filename;

	if (config.database === "postgresql") {
		dbTemplate = require(path.join(
			__dirname,
			"../templates/backend/postgresql-db.template.js"
		));
		filename = `db${ext}`;
	} else if (config.database === "mongodb") {
		dbTemplate = require(path.join(
			__dirname,
			"../templates/backend/mongodb-db.template.js"
		));
		filename = `database${ext}`;
	}

	if (dbTemplate) {
		await fs.writeFile(path.join(dbPath, filename), dbTemplate());
	}
}

async function createSampleFiles(backendPath, config) {
	const isTypeScript = config.backendTemplate.includes("ts");
	const ext = isTypeScript ? ".mts" : ".mjs";
	const baseDir = isTypeScript ? "src" : "";

	// Create sample controller
	const controllerTemplate = require(path.join(
		__dirname,
		"../templates/backend/sample-user-controller.template.js"
	));
	await fs.writeFile(
		path.join(backendPath, baseDir, "controllers", `user.controller${ext}`),
		controllerTemplate(config.database || "none")
	);

	// Create sample routes
	const routesTemplate = require(path.join(
		__dirname,
		"../templates/backend/sample-user-routes.template.js"
	));
	await fs.writeFile(
		path.join(backendPath, baseDir, "routes", `user.routes${ext}`),
		routesTemplate()
	);

	// Create database-specific files
	if (config.database === "postgresql") {
		const queryTemplate = require(path.join(
			__dirname,
			"../templates/backend/sample-user-query.template.js"
		));
		await fs.writeFile(
			path.join(backendPath, baseDir, "queries", `user.queries${ext}`),
			queryTemplate()
		);
	} else if (config.database === "mongodb") {
		const modelTemplate = require(path.join(
			__dirname,
			"../templates/backend/sample-user-model.template.js"
		));
		await fs.writeFile(
			path.join(backendPath, baseDir, "models", `user.model${ext}`),
			modelTemplate()
		);
	}
}

async function setupAdditionalFeatures(projectPath, config) {
	const spinner = ora("Setting up additional features...").start();

	try {
		// Environment variables
		if (
			config.additionalFeatures.includes("env") ||
			config.database !== "none"
		) {
			let envContent = `# Environment Variables
NODE_ENV=development
PORT=5000
`;

			if (config.database === "postgresql") {
				envContent += `
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=postgres
DB_PASSWORD=password
`;
			} else if (config.database === "mongodb") {
				envContent += `
# MongoDB Configuration
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.qct1l3d.mongodb.net/
DB_NAME=myapp
`;
			}

			if (config.additionalFeatures.includes("auth")) {
				envContent += `
# Authentication
JWT_SECRET=your-super-secret-jwt-key
`;
			}

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
} application scaffolded with create-another-app.

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
}${config.includeTailwind ? "- 🎨 Tailwind CSS v4 for styling\n" : ""}${
		config.projectType !== "frontend"
			? `- 🚀 Express.js backend${
					config.backendTemplate.includes("ts")
						? " with TypeScript"
						: ""
			  }\n`
			: ""
	}${
		config.database === "mongodb"
			? "- 🗄️ MongoDB integration with Mongoose\n"
			: ""
	}${
		config.database === "postgresql"
			? "- 🐘 PostgreSQL integration with pg\n"
			: ""
	}${
		config.additionalFeatures.includes("env") || config.database !== "none"
			? "- 🔧 Environment variables setup\n"
			: ""
	}

## License

MIT
`;

	await fs.writeFile(path.join(projectPath, "README.md"), readmeContent);
}

module.exports = { scaffold };
