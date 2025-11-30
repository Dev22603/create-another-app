#!/usr/bin/env node

const { Command } = require('commander');
const inquirer = require('inquirer');
const { Chalk } = require('chalk');
const chalk = new Chalk();
const ora = require('ora');
const { scaffold } = require('./utils/scaffold');

const program = new Command();

program
  .name('create-another-app')
  .description('A modern CLI tool to scaffold full-stack web applications with Next.js, React, and Express.js')
  .version('1.0.0')
  .argument('[project-name]', 'name of the project')
  .action(async (projectName) => {
    console.log(chalk.blue.bold('\n🚀 Welcome to Create Another App!\n'));

    // If no project name provided, ask for it
    if (!projectName) {
      const nameAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'What is your project name?',
          default: 'my-fullstack-app',
          validate: (input) => {
            if (input.trim() === '') return 'Project name cannot be empty';
            if (!/^[a-zA-Z0-9-_]+$/.test(input)) return 'Project name can only contain letters, numbers, hyphens, and underscores';
            return true;
          }
        }
      ]);
      projectName = nameAnswer.projectName;
    }

    // Interactive prompts for project configuration
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'What would you like to create?',
        choices: [
          { name: '🔥 Full Stack (Frontend + Backend)', value: 'fullstack' },
          { name: '⚛️  Frontend Only', value: 'frontend' },
          { name: '🚀 Backend Only', value: 'backend' }
        ]
      },
      {
        type: 'list',
        name: 'frontendFramework',
        message: 'Choose your frontend framework:',
        choices: [
          { name: 'React', value: 'react' },
          { name: 'React with TypeScript', value: 'react-ts' },
          { name: 'Next.js', value: 'nextjs' },
          { name: 'Next.js with TypeScript', value: 'nextjs-ts' }
        ],
        when: (answers) => answers.projectType === 'fullstack' || answers.projectType === 'frontend'
      },
      {
        type: 'confirm',
        name: 'includeTailwind',
        message: 'Would you like to include Tailwind CSS?',
        default: true,
        when: (answers) => answers.projectType === 'fullstack' || answers.projectType === 'frontend'
      },
      {
        type: 'list',
        name: 'backendTemplate',
        message: 'Choose your backend setup:',
        choices: [
          { name: 'Express.js with JavaScript', value: 'express-js' },
          { name: 'Express.js with TypeScript', value: 'express-ts' }
        ],
        when: (answers) => answers.projectType === 'fullstack' || answers.projectType === 'backend'
      },
      {
        type: 'checkbox',
        name: 'additionalFeatures',
        message: 'Select additional features:',
        choices: [
          { name: 'Environment variables setup (.env)', value: 'env' },
          { name: 'ESLint configuration', value: 'eslint' },
          { name: 'Prettier configuration', value: 'prettier' },
          { name: 'MongoDB connection setup', value: 'mongodb' },
          { name: 'Authentication middleware setup', value: 'auth' }
        ]
      },
      {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Would you like to install dependencies automatically?',
        default: true
      }
    ]);

    // Start scaffolding
    const spinner = ora('Creating your project...').start();

    try {
      await scaffold(projectName, answers);
      spinner.succeed(chalk.green('✅ Project created successfully!'));

      // Display next steps
      console.log(chalk.yellow('\n🎉 Your project is ready!\n'));
      console.log(chalk.cyan('Next steps:'));
      console.log(chalk.white(`  cd ${projectName}`));
      
      if (answers.projectType === 'fullstack') {
        console.log(chalk.white('  # Start frontend:'));
        console.log(chalk.white('  cd frontend && npm run dev'));
        console.log(chalk.white('  # Start backend (in another terminal):'));
        console.log(chalk.white('  cd backend && npm run dev'));
      } else if (answers.projectType === 'frontend') {
        console.log(chalk.white('  npm run dev'));
      } else {
        console.log(chalk.white('  npm run dev'));
      }

    } catch (error) {
      spinner.fail(chalk.red('❌ Failed to create project'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program.parse();