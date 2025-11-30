# create-another-app

A powerful CLI tool to scaffold full-stack web applications with Next.js, React, and Express.js. Skip the tedious setup and jump straight into building your application with modern frameworks and best practices.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org)

## 🚀 Quick Start

```bash
# Install globally (when published)
npm install -g @devbachani/create-another-app

# Create a new project
create-another-app my-awesome-app

# Or run directly with npx (no installation needed)
npx @devbachani/create-another-app my-awesome-app
```

Follow the interactive prompts to customize your project setup!

## ✨ Features

- **📦 Multiple Project Types**
  - Full-stack applications (Frontend + Backend)
  - Frontend-only projects
  - Backend-only projects

- **⚛️ Frontend Frameworks**
  - React (JavaScript or TypeScript)
  - Next.js (JavaScript or TypeScript)

- **🚂 Backend Framework**
  - Express.js (JavaScript or TypeScript)

- **🎨 Styling**
  - Tailwind CSS integration (optional)
  - Automatic configuration and setup

- **🔧 Additional Features**
  - Environment variables setup (.env files)
  - ESLint & Prettier configuration
  - MongoDB + Mongoose integration
  - Authentication boilerplate
  - TypeScript support across the stack

- **⚡ Modern Build Tools**
  - Vite for React projects (lightning-fast HMR)
  - Next.js for optimized React applications
  - Hot Module Replacement (HMR)
  - Optimized production builds

## 📋 Prerequisites

- **Node.js** version 16 or higher
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version  # Should be >= 16.x
npm --version
```

## 🛠️ Installation

### Global Installation (Recommended)

```bash
npm install -g @devbachani/create-another-app
```

After installation, the `create-another-app` command will be available globally.

### Local Installation

```bash
npm install @devbachani/create-another-app
```

Then run with:
```bash
npx @devbachani/create-another-app
```

### Testing Locally (For Development)

If you're developing or contributing to this package, you can test it locally:

```bash
# 1. Clone the repository
git clone https://github.com/Dev22603/create-another-app.git
cd create-another-app

# 2. Install dependencies
npm install

# 3. Link the package globally
npm link

# 4. Test the CLI (from any directory)
cd ..
create-another-app test-project

# 5. When done testing, unlink
npm unlink -g @devbachani/create-another-app
```

**Note:** If you have an old version globally installed, uninstall it first:
```bash
npm uninstall -g create-fullstack-app
npm unlink -g @devbachani/create-another-app
```

## 📖 Usage

### Interactive Mode

Simply run the command and follow the prompts:

```bash
create-another-app
```

You'll be asked to configure:
1. **Project name** - The name of your project
2. **Project type** - Fullstack, Frontend only, or Backend only
3. **Frontend framework** - React or Next.js (with or without TypeScript)
4. **Backend template** - Express.js (with JavaScript or TypeScript)
5. **Tailwind CSS** - Include Tailwind for styling
6. **Additional features** - Environment variables, linting, MongoDB, authentication
7. **Dependency installation** - Automatically run `npm install`

### Command Line Arguments

You can also provide the project name as an argument:

```bash
create-another-app my-project-name
```

## 🏗️ Generated Project Structure

### Full-Stack Project

```
my-fullstack-app/
├── frontend/
│   ├── src/
│   │   ├── App.jsx (or .tsx)
│   │   ├── main.jsx (or .tsx)
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js (if Tailwind selected)
│   └── postcss.config.js (if Tailwind selected)
├── backend/
│   ├── src/ (TypeScript projects)
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.ts
│   ├── routes/ (JavaScript projects)
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   ├── server.js (or server.ts)
│   ├── package.json
│   ├── tsconfig.json (if TypeScript)
│   ├── .env.example (if env vars selected)
│   └── .gitignore
└── README.md
```

### Frontend-Only Project

```
my-frontend-app/
├── src/
│   ├── App.jsx (or .tsx)
│   ├── main.jsx (or .tsx)
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js (if selected)
└── README.md
```

### Backend-Only Project

```
my-backend-app/
├── src/ (TypeScript)
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── utils/
│   └── server.ts
├── routes/ (JavaScript)
├── controllers/
├── models/
├── middleware/
├── utils/
├── server.js (or server.ts)
├── package.json
├── tsconfig.json (if TypeScript)
├── .env.example (if env vars selected)
└── README.md
```

## 🎯 Example Workflows

### Creating a React + Express Full-Stack App with TypeScript

```bash
create-another-app my-app
# Select:
# - Project type: fullstack
# - Frontend: React with TypeScript
# - Backend: Express with TypeScript
# - Include Tailwind: Yes
# - Additional features: Environment variables, ESLint & Prettier
# - Install dependencies: Yes

cd my-app

# Start frontend (in one terminal)
cd frontend
npm run dev

# Start backend (in another terminal)
cd backend
npm run dev
```

### Creating a Next.js Frontend-Only App

```bash
create-another-app my-nextjs-app
# Select:
# - Project type: frontend
# - Frontend: Next.js with TypeScript
# - Include Tailwind: Yes
# - Install dependencies: Yes

cd my-nextjs-app
npm run dev
```

### Creating an Express Backend with MongoDB

```bash
create-another-app my-api
# Select:
# - Project type: backend
# - Backend: Express.js with TypeScript
# - Additional features: Environment variables, MongoDB & Mongoose
# - Install dependencies: Yes

cd my-api
# Configure .env file with MongoDB connection string
npm run dev
```

## 📦 Dependencies Installed

### Frontend Dependencies (varies by selection)

- **React Projects (Vite)**: `react`, `react-dom`, `vite`
- **Next.js Projects**: `next`, `react`, `react-dom`
- **Tailwind CSS**: `tailwindcss`, `postcss`, `autoprefixer`

### Backend Dependencies (varies by selection)

- **Express**: `express`, `cors`
- **TypeScript**: `typescript`, `@types/node`, `tsx`, `@types/express`
- **MongoDB**: `mongoose`, `dotenv`
- **Development**: `nodemon` (for auto-restart)
- **Linting**: `eslint`, `prettier`

## 🔧 Configuration Files

The tool automatically generates configuration files based on your selections:

- **package.json** - Custom scripts and dependencies
- **vite.config.js** - Vite configuration (for React projects)
- **next.config.js** - Next.js configuration (for Next.js projects)
- **tailwind.config.js** - Tailwind CSS configuration
- **postcss.config.js** - PostCSS configuration
- **tsconfig.json** - TypeScript configuration
- **.env.example** - Environment variable template
- **.gitignore** - Git ignore patterns

## 🚀 Running Your Generated Project

### Development Mode

**Full-Stack:**
```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
npm run dev
```

**Frontend-Only:**
```bash
npm run dev
```

**Backend-Only:**
```bash
npm run dev  # or npm start
```

### Production Build

**Frontend:**
```bash
npm run build
npm run preview  # Preview production build
```

**Backend:**
```bash
npm start  # Runs without nodemon
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Dev Bachani**

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on the [GitHub repository](https://github.com/Dev22603/create-another-app/issues).

## 📚 Tech Stack Overview

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Commander.js | CLI argument parsing |
| Inquirer.js | Interactive prompts |
| Chalk | Terminal styling |
| Ora | Loading spinners |
| fs-extra | File system operations |
| Vite | Build tool for React projects |
| Next.js | React framework with SSR |
| React | Frontend framework |
| Express.js | Backend framework |
| Tailwind CSS | Utility-first CSS |
| MongoDB | Database (optional) |
| TypeScript | Type safety (optional) |

## ⚡ Performance

- **Fast Setup**: Generate a complete project in seconds
- **Optimized Builds**: Vite and Next.js provide lightning-fast HMR and optimized production builds
- **Smart Defaults**: Sensible configurations that work out of the box
- **Minimal Dependencies**: Only install what you need

## 🎓 Learning Resources

### Frontend
- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)

### Backend
- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://www.mongodb.com/docs)
- [Mongoose Documentation](https://mongoosejs.com)

### TypeScript
- [TypeScript Documentation](https://www.typescriptlang.org)

## 🔮 Roadmap

- [ ] Support for additional frontend frameworks (Svelte, Angular)
- [ ] Database options (PostgreSQL, MySQL)
- [ ] Docker configuration
- [ ] Testing setup (Jest, Vitest, Playwright)
- [ ] CI/CD pipeline templates
- [ ] GraphQL support
- [ ] WebSocket integration
- [ ] Authentication providers (OAuth, JWT)

## 💬 FAQ

### Q: Can I customize the generated project structure?
A: Yes! After generation, you have full control to modify the structure as needed.

### Q: Does this work on Windows/Mac/Linux?
A: Yes, it works on all platforms that support Node.js >= 16.

### Q: Can I use yarn or pnpm instead of npm?
A: Currently, the tool uses npm for dependency installation. You can manually switch to yarn/pnpm after generation.

### Q: How do I update to the latest version?
A: Run `npm update -g @devbachani/create-another-app` to get the latest version.

### Q: Can I add features after project generation?
A: Yes, you can manually add any features to your generated project afterward.

---

**Made with ❤️ by Dev Bachani**

Star ⭐ this repository if you find it helpful!
