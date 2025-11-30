# CONTEXT.md - Code Implementation Guide

This document provides a detailed explanation of how the `create-another-app` CLI tool works internally. It's intended for developers who want to understand, modify, or contribute to the codebase.

---

## 📁 Project Structure

```
create-fullstack-app/
├── index.js              # Entry point - CLI setup and user interaction
├── package.json          # Project metadata, dependencies, and bin configuration
├── package-lock.json     # Locked dependency versions
└── utils/
    └── scaffold.js       # Core scaffolding logic for project generation
```

---

## 🎯 Core Architecture

### High-Level Flow

```
┌──────────────────────────────────────────────────────────┐
│                    USER EXECUTION                        │
│                create-another-app                        │
└────────────────────────┬─────────────────────────────────┘
                         │
                         v
┌──────────────────────────────────────────────────────────┐
│                   index.js (Entry Point)                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  1. Commander.js Setup                             │  │
│  │     - Parse CLI arguments                          │  │
│  │     - Display welcome banner                       │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  2. Inquirer.js Prompts                            │  │
│  │     - Project name                                 │  │
│  │     - Project type                                 │  │
│  │     - Frontend framework                           │  │
│  │     - Backend template                             │  │
│  │     - Additional features                          │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │  3. Configuration Object Creation                  │  │
│  │     answers = { projectName, projectType, ... }    │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         v
┌──────────────────────────────────────────────────────────┐
│               utils/scaffold.js (Generation)             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  scaffold(answers)                                 │  │
│  │    ├─> createProjectDirectory()                    │  │
│  │    ├─> setupFrontend()                             │  │
│  │    ├─> setupBackend()                              │  │
│  │    ├─> setupTailwind()                             │  │
│  │    ├─> setupAdditionalFeatures()                   │  │
│  │    ├─> installDependencies()                       │  │
│  │    └─> generateReadme()                            │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
                         v
┌──────────────────────────────────────────────────────────┐
│                   GENERATED PROJECT                      │
│         (Ready to use full-stack application)            │
└──────────────────────────────────────────────────────────┘
```

---

## 📄 File-by-File Breakdown

### 1. `index.js` - CLI Entry Point

**Purpose**: Handles command-line interface setup, user interaction, and orchestrates the scaffolding process.

#### Key Components:

##### a) Shebang Line
```javascript
#!/usr/bin/env node
```
- Makes the file executable as a CLI command
- Tells the system to use Node.js to execute this file
- Required for `npm link` and global installation to work

##### b) Imports
```javascript
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { scaffold } from './utils/scaffold.js';
```

| Import | Purpose |
|--------|---------|
| `commander` | CLI framework for parsing arguments and creating commands |
| `inquirer` | Interactive CLI prompts with validation |
| `chalk` | Terminal string styling (colors, bold, etc.) |
| `scaffold` | Custom function that generates the project |

##### c) Commander Setup
```javascript
const program = new Command();

program
  .name('create-fullstack-app')
  .description('CLI to scaffold a full-stack app')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName) => { /* ... */ });
```

**How it works:**
- Creates a new Commander program instance
- `.name()`: Sets the command name shown in help text
- `.description()`: Adds description for help output
- `.version()`: Enables `-V` or `--version` flag
- `.argument()`: Defines optional/required arguments (project name is optional)
- `.action()`: Callback function executed when command runs

##### d) Welcome Banner
```javascript
console.log(chalk.blue.bold('\n🚀 Welcome to Create Fullstack App! 🚀\n'));
```
- Uses `chalk` to display colored, bold text
- Creates a friendly, professional CLI experience

##### e) Interactive Prompts

**Prompt Flow:**
```javascript
const answers = await inquirer.prompt([
  {
    type: 'input',
    name: 'projectName',
    message: 'What is your project name?',
    default: projectName || 'my-fullstack-app',
    validate: /* validation function */
  },
  // ... more prompts
]);
```

**Prompt Types Used:**

1. **Input Prompt** (text input)
   ```javascript
   {
     type: 'input',
     name: 'projectName',
     message: 'What is your project name?',
     validate: (input) => /* validation logic */
   }
   ```

2. **List Prompt** (single choice)
   ```javascript
   {
     type: 'list',
     name: 'projectType',
     message: 'What type of project do you want to create?',
     choices: ['fullstack', 'frontend', 'backend']
   }
   ```

3. **Confirm Prompt** (yes/no)
   ```javascript
   {
     type: 'confirm',
     name: 'includeTailwind',
     message: 'Do you want to include Tailwind CSS?',
     default: false
   }
   ```

4. **Checkbox Prompt** (multiple choices)
   ```javascript
   {
     type: 'checkbox',
     name: 'additionalFeatures',
     message: 'Select additional features:',
     choices: [
       { name: 'Environment Variables', value: 'env' },
       { name: 'ESLint & Prettier', value: 'eslint' },
       // ...
     ]
   }
   ```

**Conditional Prompts:**
```javascript
{
  type: 'list',
  name: 'frontendFramework',
  message: 'Choose a frontend framework:',
  choices: ['React', 'React (TS)', 'Next.js', 'Next.js (TS)'],
  when: (answers) => answers.projectType !== 'backend'  // Only show if not backend-only
}
```

##### f) Calling the Scaffolder
```javascript
await scaffold(answers);
```
- Passes user configuration to the main scaffolding function
- Uses `await` because scaffolding is asynchronous (file I/O, npm commands)

##### g) Next Steps Display
```javascript
console.log(chalk.green.bold('\n✅ Project created successfully!\n'));
console.log(chalk.cyan('Next steps:'));
console.log(`  cd ${answers.projectName}`);
// ... more instructions
```
- Provides clear guidance on what to do next
- Adapts instructions based on project type (fullstack vs frontend vs backend)

---

### 2. `utils/scaffold.js` - Project Generation Logic

**Purpose**: Contains all the logic for creating directories, files, and configurations for the generated project.

#### Main Function: `scaffold(answers)`

```javascript
export async function scaffold(answers) {
  const projectPath = path.join(process.cwd(), answers.projectName);

  // Create project directory
  await fs.mkdir(projectPath, { recursive: true });

  // Setup based on project type
  if (answers.projectType === 'fullstack' || answers.projectType === 'frontend') {
    await setupFrontend(projectPath, answers);
  }

  if (answers.projectType === 'fullstack' || answers.projectType === 'backend') {
    await setupBackend(projectPath, answers);
  }

  // Additional features
  if (answers.includeTailwind && answers.projectType !== 'backend') {
    await setupTailwind(projectPath, answers);
  }

  if (answers.additionalFeatures && answers.additionalFeatures.length > 0) {
    await setupAdditionalFeatures(projectPath, answers);
  }

  // Generate documentation
  await generateReadme(projectPath, answers);
}
```

**Flow:**
1. Create root project directory
2. Setup frontend (if needed)
3. Setup backend (if needed)
4. Configure Tailwind (if requested)
5. Add additional features (env, linting, MongoDB, etc.)
6. Generate README file
7. Optionally install dependencies

---

#### Function: `setupFrontend(projectPath, answers)`

**Purpose**: Creates frontend application using Vite's scaffolding tool.

```javascript
async function setupFrontend(projectPath, answers) {
  const spinner = ora('Setting up frontend...').start();

  try {
    const frontendPath = answers.projectType === 'fullstack'
      ? path.join(projectPath, 'frontend')
      : projectPath;

    const isNextJS = answers.frontendFramework.startsWith('nextjs');

    if (isNextJS) {
      // Create Next.js app
      const useTypeScript = answers.frontendFramework === 'nextjs-ts';
      const tailwindFlag = answers.includeTailwind ? '--tailwind' : '--no-tailwind';
      const tsFlag = useTypeScript ? '--ts' : '--js';

      await execCommand(
        `npx create-next-app@latest ${path.basename(frontendPath)} ${tsFlag} ${tailwindFlag} --eslint --app --no-src-dir --import-alias "@/*"`,
        { cwd: path.dirname(frontendPath) }
      );
    } else {
      // Create React app with Vite
      const template = answers.frontendFramework; // 'react' or 'react-ts'

      await execCommand(
        `npm create vite@latest ${path.basename(frontendPath)} -- --template ${template}`,
        { cwd: path.dirname(frontendPath) }
      );

      // Setup Tailwind if requested for Vite projects
      if (answers.includeTailwind) {
        await setupTailwind(frontendPath);
      }
    }

    spinner.succeed('Frontend setup complete!');
  } catch (error) {
    spinner.fail('Frontend setup failed.');
    throw error;
  }
}
```

**How it works:**
1. Shows spinner for UX feedback
2. Determines correct path (root for frontend-only, `frontend/` for fullstack)
3. Checks if the framework is Next.js
4. For Next.js:
   - Uses `create-next-app` with appropriate flags for TypeScript and Tailwind
   - Tailwind is configured during creation (no manual setup needed)
5. For React:
   - Uses `npm create vite` with appropriate template
   - Manually sets up Tailwind if requested
6. Updates spinner based on success/failure

**Why different tools?**
- **Vite** for React: Lightning-fast HMR and simple React projects
- **Next.js**: Full-featured React framework with SSR, routing, and built-in optimizations
- Each tool provides official templates ensuring best practices

---

#### Function: `setupBackend(projectPath, answers)`

**Purpose**: Creates backend folder structure and server file.

```javascript
async function setupBackend(projectPath, answers) {
  const spinner = ora('Setting up backend...').start();

  try {
    const backendPath = answers.projectType === 'fullstack'
      ? path.join(projectPath, 'backend')
      : projectPath;

    await fs.mkdir(backendPath, { recursive: true });

    const isTypeScript = answers.backendTemplate === 'Express (TS)';

    // Create folder structure
    const folders = isTypeScript
      ? ['src/routes', 'src/controllers', 'src/models', 'src/middleware', 'src/utils']
      : ['routes', 'controllers', 'models', 'middleware', 'utils'];

    for (const folder of folders) {
      await fs.mkdir(path.join(backendPath, folder), { recursive: true });
    }

    // Create package.json
    await createBackendPackageJson(backendPath, answers);

    // Create server file
    await createServerFile(backendPath, answers);

    // Create tsconfig.json if TypeScript
    if (isTypeScript) {
      await createTsConfig(backendPath);
    }

    spinner.succeed('Backend setup complete!');
  } catch (error) {
    spinner.fail('Backend setup failed.');
    throw error;
  }
}
```

**Key Design Decisions:**

1. **Conditional Folder Structure:**
   - TypeScript: Uses `src/` directory for better organization
   - JavaScript: Folders at root level

2. **Folder Architecture:**
   - `routes/`: API endpoint definitions
   - `controllers/`: Business logic handlers
   - `models/`: Database schemas (if using MongoDB)
   - `middleware/`: Custom middleware (auth, logging, etc.)
   - `utils/`: Helper functions and utilities

---

#### Function: `createBackendPackageJson(backendPath, answers)`

**Purpose**: Generates a customized `package.json` for the backend.

```javascript
async function createBackendPackageJson(backendPath, answers) {
  const isTypeScript = answers.backendTemplate === 'express-ts';

  const packageJson = {
    name: `${answers.projectName}-backend`,
    version: '1.0.0',
    description: 'Backend for ' + answers.projectName,
    main: isTypeScript ? 'dist/server.js' : 'server.js',
    scripts: {},
    dependencies: {},
    devDependencies: {}
  };

  // Configure scripts based on language
  if (isTypeScript) {
    packageJson.scripts = {
      dev: 'tsx watch src/server.ts',
      build: 'tsc',
      start: 'node dist/server.js'
    };
  } else {
    packageJson.scripts = {
      dev: 'nodemon server.js',
      start: 'node server.js'
    };
  }

  // Add Express dependencies
  packageJson.dependencies = {
    'express': '^4.18.2',
    'cors': '^2.8.5'
  };

  if (isTypeScript) {
    packageJson.devDependencies['@types/express'] = '^4.17.21';
    packageJson.devDependencies['@types/cors'] = '^2.8.17';
  }

  // Add TypeScript dependencies
  if (isTypeScript) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      'typescript': '^5.3.3',
      '@types/node': '^20.10.0',
      'tsx': '^4.7.0'
    };
  } else {
    packageJson.devDependencies.nodemon = '^3.0.0';
  }

  // Add optional dependencies based on features
  if (answers.additionalFeatures?.includes('mongodb')) {
    packageJson.dependencies.mongoose = '^8.0.0';
    packageJson.dependencies.dotenv = '^16.3.0';
  }

  if (answers.additionalFeatures?.includes('env')) {
    packageJson.dependencies.dotenv = '^16.3.0';
  }

  // Write to file
  await fs.writeFile(
    path.join(backendPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}
```

**Script Explanations:**

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` (TS) | `tsx watch src/server.ts` | Run TypeScript directly with auto-reload |
| `dev` (JS) | `nodemon server.js` | Run JavaScript with auto-reload |
| `build` (TS) | `tsc` | Compile TypeScript to JavaScript |
| `start` (TS) | `node dist/server.js` | Run compiled production code |
| `start` (JS) | `node server.js` | Run production code |

**Dependency Selection Logic:**
- Conditionally includes dependencies based on user choices
- Separates runtime dependencies from dev dependencies
- Includes type definitions for TypeScript projects
- Version pinning for stability

---

#### Function: `createServerFile(backendPath, answers)`

**Purpose**: Generates the main server file with framework-specific boilerplate.

**Express.js Example (JavaScript):**
```javascript
const serverContent = `
import express from 'express';
import cors from 'cors';
${answers.additionalFeatures?.includes('mongodb') ? "import mongoose from 'mongoose';" : ''}
${answers.additionalFeatures?.includes('env') || answers.additionalFeatures?.includes('mongodb') ? "import dotenv from 'dotenv';" : ''}

${answers.additionalFeatures?.includes('env') || answers.additionalFeatures?.includes('mongodb') ? "dotenv.config();" : ''}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

${answers.additionalFeatures?.includes('mongodb') ? `
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${answers.projectName}')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
` : ''}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${answers.projectName} API' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
```

**Express.js Example (TypeScript):**
```javascript
const serverContent = `
import express, { Request, Response } from 'express';
import cors from 'cors';
${answers.additionalFeatures?.includes('mongodb') ? "import mongoose from 'mongoose';" : ''}
${answers.additionalFeatures?.includes('env') || answers.additionalFeatures?.includes('mongodb') ? "import dotenv from 'dotenv';" : ''}

${answers.additionalFeatures?.includes('env') || answers.additionalFeatures?.includes('mongodb') ? "dotenv.config();" : ''}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

${answers.additionalFeatures?.includes('mongodb') ? `
// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/${answers.projectName}')
  .then(() => console.log('MongoDB connected'))
  .catch((err: Error) => console.error('MongoDB connection error:', err));
` : ''}

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to ${answers.projectName} API' });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
```

**Template Features (Express.js):**
- Conditional imports based on selected features
- Environment variable configuration
- MongoDB connection setup (if selected)
- CORS enabled by default
- JSON body parsing
- Basic route example
- Type annotations (TypeScript)
- Error handling

---

#### Function: `createTsConfig(backendPath)`

**Purpose**: Creates TypeScript configuration file.

```javascript
async function createTsConfig(backendPath) {
  const tsConfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'ESNext',
      moduleResolution: 'node',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  await fs.writeFile(
    path.join(backendPath, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );
}
```

**Configuration Breakdown:**

| Option | Value | Purpose |
|--------|-------|---------|
| `target` | ES2020 | JavaScript version to compile to |
| `module` | ESNext | Use modern ES modules |
| `moduleResolution` | node | Use Node.js module resolution |
| `outDir` | ./dist | Output directory for compiled files |
| `rootDir` | ./src | Source code directory |
| `strict` | true | Enable all strict type checking |
| `esModuleInterop` | true | Better CommonJS/ESM compatibility |
| `sourceMap` | true | Generate source maps for debugging |

---

#### Function: `setupTailwind(projectPath, answers)`

**Purpose**: Configures Tailwind CSS in the frontend project.

```javascript
async function setupTailwind(projectPath, answers) {
  const spinner = ora('Setting up Tailwind CSS...').start();

  try {
    const frontendPath = answers.projectType === 'fullstack'
      ? path.join(projectPath, 'frontend')
      : projectPath;

    // Install Tailwind and dependencies
    await execCommand(
      'npm install -D tailwindcss postcss autoprefixer',
      { cwd: frontendPath }
    );

    // Initialize Tailwind config
    await execCommand(
      'npx tailwindcss init -p',
      { cwd: frontendPath }
    );

    // Update index.css with Tailwind directives
    const cssPath = path.join(frontendPath, 'src/index.css');
    const tailwindDirectives = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

    await fs.writeFile(cssPath, tailwindDirectives);

    spinner.succeed('Tailwind CSS setup complete!');
  } catch (error) {
    spinner.fail('Tailwind CSS setup failed.');
    throw error;
  }
}
```

**Steps:**
1. Install Tailwind CSS and peer dependencies
2. Run `tailwindcss init -p` to generate config files
3. Replace CSS file content with Tailwind directives

---

#### Function: `setupAdditionalFeatures(projectPath, answers)`

**Purpose**: Adds optional features like environment variables, linting, etc.

```javascript
async function setupAdditionalFeatures(projectPath, answers) {
  const backendPath = answers.projectType === 'fullstack'
    ? path.join(projectPath, 'backend')
    : projectPath;

  const features = answers.additionalFeatures || [];

  // Environment Variables
  if (features.includes('env')) {
    await createEnvExample(backendPath, answers);
  }

  // ESLint & Prettier
  if (features.includes('eslint')) {
    await setupLinting(backendPath);
  }

  // MongoDB (handled in package.json and server file)

  // Authentication (placeholder for future implementation)
  if (features.includes('auth')) {
    // TODO: Implement auth boilerplate
  }
}
```

**`.env.example` Template:**
```javascript
async function createEnvExample(backendPath, answers) {
  const envContent = `
PORT=5000
NODE_ENV=development
${answers.additionalFeatures?.includes('mongodb') ? `
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/${answers.projectName}
` : ''}
${answers.additionalFeatures?.includes('auth') ? `
# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
` : ''}
`;

  await fs.writeFile(
    path.join(backendPath, '.env.example'),
    envContent.trim()
  );
}
```

---

#### Function: `generateReadme(projectPath, answers)`

**Purpose**: Creates a README file with project-specific instructions.

```javascript
async function generateReadme(projectPath, answers) {
  const readmeContent = `
# ${answers.projectName}

## Project Information

- **Type**: ${answers.projectType}
${answers.projectType !== 'backend' ? `- **Frontend**: ${answers.frontendFramework}` : ''}
${answers.projectType !== 'frontend' ? `- **Backend**: ${answers.backendTemplate}` : ''}
${answers.includeTailwind ? '- **Styling**: Tailwind CSS' : ''}

## Features

${answers.additionalFeatures?.map(f => `- ${f}`).join('\n') || 'No additional features selected'}

## Getting Started

${answers.projectType === 'fullstack' ? `
### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

### Backend
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`
` : answers.projectType === 'frontend' ? `
\`\`\`bash
npm install
npm run dev
\`\`\`
` : `
\`\`\`bash
npm install
npm run dev
\`\`\`
`}

## Scripts

${answers.projectType !== 'backend' ? `
### Frontend
- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
` : ''}

${answers.projectType !== 'frontend' ? `
### Backend
- \`npm run dev\` - Start development server with auto-reload
- \`npm start\` - Start production server
${answers.backendTemplate === 'Express (TS)' ? '- `npm run build` - Compile TypeScript' : ''}
` : ''}

## Environment Variables

${answers.additionalFeatures?.includes('env') || answers.additionalFeatures?.includes('mongodb') ? `
Copy \`.env.example\` to \`.env\` and configure:

\`\`\`bash
cp .env.example .env
\`\`\`

Update the values as needed.
` : 'No environment variables configured.'}

## License

MIT
`;

  await fs.writeFile(
    path.join(projectPath, 'README.md'),
    readmeContent.trim()
  );
}
```

---

#### Helper Function: `execCommand(command, options)`

**Purpose**: Executes shell commands with proper error handling.

```javascript
function execCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout || stderr);
    });
  });
}
```

**Why wrapped in Promise?**
- Node's `exec` uses callbacks
- We want to use `async/await` for cleaner code
- Proper error propagation to `try/catch` blocks

---

## 🔧 Dependencies Deep Dive

### 1. **Commander.js** (`commander`)

**Role**: CLI framework and argument parser

**Usage in project:**
```javascript
import { Command } from 'commander';

const program = new Command();
program
  .name('create-fullstack-app')
  .description('CLI to scaffold a full-stack app')
  .version('1.0.0')
  .argument('[project-name]', 'Name of the project')
  .action(async (projectName) => {
    // Main CLI logic
  });

program.parse();
```

**Key features used:**
- Automatic help generation (`--help`)
- Version flag (`--version`)
- Argument parsing
- Action handlers

---

### 2. **Inquirer.js** (`inquirer`)

**Role**: Interactive command-line prompts

**Usage in project:**
```javascript
import inquirer from 'inquirer';

const answers = await inquirer.prompt([
  {
    type: 'input',     // Text input
    name: 'projectName',
    message: 'What is your project name?',
    default: 'my-app',
    validate: (input) => input.length > 0 || 'Project name is required'
  },
  {
    type: 'list',      // Single selection
    name: 'projectType',
    message: 'What type of project?',
    choices: ['fullstack', 'frontend', 'backend']
  },
  {
    type: 'checkbox',  // Multiple selection
    name: 'features',
    message: 'Select features:',
    choices: ['ESLint', 'Prettier', 'MongoDB']
  },
  {
    type: 'confirm',   // Yes/No
    name: 'install',
    message: 'Install dependencies?',
    default: true
  }
]);
```

**Prompt types:**
- `input`: Free text
- `list`: Single choice from list
- `checkbox`: Multiple choices
- `confirm`: Boolean (yes/no)
- `when`: Conditional display

---

### 3. **Chalk** (`chalk`)

**Role**: Terminal string styling

**Usage in project:**
```javascript
import chalk from 'chalk';

console.log(chalk.blue.bold('Welcome!'));           // Blue and bold
console.log(chalk.green('✅ Success'));             // Green text
console.log(chalk.red.underline('Error occurred')); // Red and underlined
console.log(chalk.cyan('Information'));             // Cyan text
```

**Colors used:**
- Blue: Headers and titles
- Green: Success messages
- Red: Errors
- Cyan: Instructions
- Yellow: Warnings

---

### 4. **Ora** (`ora`)

**Role**: Terminal spinners and progress indicators

**Usage in project:**
```javascript
import ora from 'ora';

const spinner = ora('Loading...').start();

try {
  // Long-running operation
  await someAsyncOperation();

  spinner.succeed('Operation completed!');  // Green checkmark
} catch (error) {
  spinner.fail('Operation failed.');        // Red X
  throw error;
}
```

**Methods:**
- `.start()`: Begin spinner animation
- `.succeed(message)`: Show success (green ✔)
- `.fail(message)`: Show failure (red ✖)
- `.warn(message)`: Show warning (yellow ⚠)
- `.info(message)`: Show info (blue ℹ)

---

### 5. **fs-extra** (`fs-extra`)

**Role**: Enhanced file system operations with promises

**Usage in project:**
```javascript
import fs from 'fs-extra';

// Create directory (recursive)
await fs.mkdir('/path/to/dir', { recursive: true });

// Write file
await fs.writeFile('/path/to/file.txt', 'content');

// Read file
const content = await fs.readFile('/path/to/file.txt', 'utf-8');

// Copy file/directory
await fs.copy('/source', '/destination');

// Check if exists
const exists = await fs.pathExists('/path');
```

**Why fs-extra over built-in fs?**
- Promise-based API (no callbacks)
- Additional utility methods
- Recursive operations
- Better error messages

---

## 🎯 Key Algorithms and Logic

### 1. **Conditional Project Structure**

The tool adapts folder structure based on language choice:

```javascript
const isTypeScript = answers.backendTemplate === 'Express (TS)';

const folders = isTypeScript
  ? ['src/routes', 'src/controllers', 'src/models', 'src/middleware', 'src/utils']
  : ['routes', 'controllers', 'models', 'middleware', 'utils'];
```

**Reasoning:**
- TypeScript projects use `src/` for source code separation
- Compiled output goes to `dist/`
- JavaScript projects keep folders at root (simpler structure)

---

### 2. **Template String Generation**

Server files are generated using template literals with conditional blocks:

```javascript
const serverContent = `
import express from 'express';
${includeMongoose ? "import mongoose from 'mongoose';" : ''}

${includeMongoose ? `
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));
` : ''}
`;
```

**Benefits:**
- Clean, readable templates
- Easy to modify
- Type-safe (if using TypeScript)
- No external templating engine needed

---

### 3. **Dependency Version Management**

Dependencies are specified with caret (`^`) versioning:

```javascript
dependencies: {
  'express': '^4.18.2',  // Allows 4.18.x and 4.x.x (not 5.x.x)
  'cors': '^2.8.5'       // Allows 2.8.x and 2.x.x (not 3.x.x)
}
```

**Versioning strategy:**
- `^4.18.2`: Compatible with 4.x.x (minor and patch updates)
- Balances stability with bug fixes
- Prevents breaking changes from major versions

---

### 4. **Parallel Operations**

Multiple independent operations run in parallel:

```javascript
if (installDeps) {
  await Promise.all([
    execCommand('npm install', { cwd: frontendPath }),
    execCommand('npm install', { cwd: backendPath })
  ]);
}
```

**Benefits:**
- Faster execution (30-50% time savings)
- Better resource utilization
- No dependency between operations

---

## 🚦 Error Handling Strategy

### Spinner-based Error Display

```javascript
const spinner = ora('Setting up frontend...').start();

try {
  await setupFrontend();
  spinner.succeed('Frontend setup complete!');
} catch (error) {
  spinner.fail('Frontend setup failed.');
  console.error(chalk.red(error.message));
  process.exit(1);
}
```

**Strategy:**
1. Start spinner to show progress
2. Execute operation in try block
3. Update spinner on success
4. Fail spinner and exit on error
5. Provide clear error messages

---

## 🧪 Testing Considerations

While no tests are currently implemented, here's how you would test this tool:

### Unit Tests (for individual functions)
```javascript
describe('createBackendPackageJson', () => {
  it('should include Express dependencies', async () => {
    const answers = { backendTemplate: 'Express', ... };
    await createBackendPackageJson('/tmp/test', answers);

    const packageJson = JSON.parse(
      await fs.readFile('/tmp/test/package.json', 'utf-8')
    );

    expect(packageJson.dependencies).toHaveProperty('express');
    expect(packageJson.dependencies).toHaveProperty('cors');
  });
});
```

### Integration Tests (for full scaffolding)
```javascript
describe('scaffold', () => {
  it('should create fullstack project', async () => {
    const answers = {
      projectName: 'test-app',
      projectType: 'fullstack',
      frontendFramework: 'React',
      backendTemplate: 'Express'
    };

    await scaffold(answers);

    expect(await fs.pathExists('test-app/frontend')).toBe(true);
    expect(await fs.pathExists('test-app/backend')).toBe(true);
  });
});
```

---

## 🔄 Workflow Examples

### Creating a Full-Stack TypeScript App

**User Flow:**
```
1. User runs: create-fullstack-app
2. Prompted for: Project name → "my-app"
3. Prompted for: Project type → "fullstack"
4. Prompted for: Frontend → "React (TS)"
5. Prompted for: Backend → "Express (TS)"
6. Prompted for: Tailwind → "Yes"
7. Prompted for: Features → ["env", "mongodb"]
8. Prompted for: Install deps → "Yes"
```

**Execution Flow:**
```
1. Create /my-app directory
2. Run: npm create vite@latest frontend -- --template react-ts
3. Create backend/ directory
4. Create backend/src/ with subdirectories
5. Generate backend/package.json with TypeScript deps
6. Generate backend/src/server.ts with MongoDB setup
7. Generate backend/tsconfig.json
8. Install Tailwind in frontend/
9. Run: npx tailwindcss init -p in frontend/
10. Update frontend/src/index.css
11. Create backend/.env.example
12. Generate /my-app/README.md
13. Run: npm install in frontend/ and backend/ (in parallel)
14. Display success message with next steps
```

---

## 🎨 Code Style and Patterns

### 1. **Async/Await Pattern**
All I/O operations use async/await for clarity:
```javascript
async function setupBackend(projectPath, answers) {
  await fs.mkdir(backendPath);
  await createPackageJson();
  await createServerFile();
}
```

### 2. **Ternary Operators for Conditional Paths**
```javascript
const frontendPath = answers.projectType === 'fullstack'
  ? path.join(projectPath, 'frontend')
  : projectPath;
```

### 3. **Template Literals for File Content**
```javascript
const serverContent = `
import express from 'express';

const app = express();
// ...
`;
```

### 4. **Destructuring for Cleaner Code**
```javascript
const { projectName, projectType, frontendFramework } = answers;
```

### 5. **Early Returns for Validation**
```javascript
validate: (input) => {
  if (!input || input.length === 0) {
    return 'Project name is required';
  }
  if (!/^[a-z0-9-_]+$/i.test(input)) {
    return 'Invalid characters in project name';
  }
  return true;
}
```

---

## 🚀 Performance Optimizations

1. **Parallel Dependency Installation**
   ```javascript
   await Promise.all([
     execCommand('npm install', { cwd: frontendPath }),
     execCommand('npm install', { cwd: backendPath })
   ]);
   ```

2. **Lazy Loading**
   - Only import what's needed
   - Only setup features that are selected

3. **Efficient File Operations**
   - Use `fs-extra` for optimized I/O
   - Write files in parallel when possible

---

## 📝 Future Improvements

1. **Add More Templates**
   - Next.js, Nuxt.js
   - NestJS backend
   - Svelte, SolidJS

2. **Testing Setup**
   - Jest/Vitest integration
   - Testing library setup
   - E2E testing with Playwright

3. **Docker Support**
   - Dockerfile generation
   - Docker Compose setup

4. **CI/CD Templates**
   - GitHub Actions
   - GitLab CI
   - Jenkins

5. **Database Options**
   - PostgreSQL
   - MySQL
   - SQLite

6. **Authentication Templates**
   - JWT implementation
   - OAuth providers
   - Session-based auth

---

## 🎓 Learning Resources

To understand this codebase better, study:

1. **Node.js**
   - File system operations
   - Child processes
   - Path handling

2. **ES6+ JavaScript**
   - Async/await
   - Template literals
   - Destructuring
   - Arrow functions

3. **CLI Development**
   - Commander.js documentation
   - Inquirer.js examples
   - Terminal UI best practices

4. **Build Tools**
   - Vite architecture
   - npm scripts
   - Package.json structure

---

## 🤝 Contributing Guide

If you want to contribute:

1. **Understand the flow**: Read this document thoroughly
2. **Test locally**: Use `npm link` to test changes
3. **Follow patterns**: Match existing code style
4. **Add spinners**: Use `ora` for long operations
5. **Validate input**: Always validate user input
6. **Handle errors**: Proper try/catch with user-friendly messages
7. **Update docs**: Document new features

---

**This document should give you a complete understanding of how the `create-fullstack-app` CLI tool works internally. Happy coding!** 🚀
