#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the correct path to our templates directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = path.join(__dirname, 'template');

/**
 * A recursive function to find all files ending in .tpl,
 * process them by replacing placeholders, and then rename them.
 */
function processTemplates(directory, replacements) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // If it's a directory, recurse into it
      processTemplates(filePath, replacements);
    } else if (filePath.endsWith('.tpl')) {
      // It's a template file, so we process it
      let content = fs.readFileSync(filePath, 'utf8');

      // --- THE FIX ---
      // A more robust loop that iterates through all provided replacements
      // using the simpler and more direct replaceAll method.
      for (const placeholder in replacements) {
        const searchString = `{{${placeholder}}}`;
        content = content.replaceAll(searchString, replacements[placeholder]);
      }

      const newFilePath = filePath.replace('.tpl', '');
      fs.writeFileSync(newFilePath, content);
      fs.unlinkSync(filePath);
    }
  }
}

// Main function to run the CLI
async function run() {
  console.log(
    chalk.blue.bold('\n🍄 Welcome to the Mycelial Shell Creator! 🍄\n')
  );
  console.log(
    chalk.yellow(
      'This tool will scaffold a new, pre-configured host application.\n'
    )
  );

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the name of your new Shell? (e.g., MycelialTools)',
      validate: (input) => {
        if (/^([A-Za-z0-9\-_]+)$/.test(input)) return true;
        return 'Please enter a valid folder name.';
      },
    },
    {
      type: 'input',
      name: 'hostName',
      message: 'What is the unique name for this host? (for discovery)',
      default: (ans) => `${ans.projectName}-Host`,
    },
    {
      type: 'input',
      name: 'port',
      message: 'Which port should its dev server run on?',
      default: '8080',
      validate: (input) => {
        const portNum = parseInt(input, 10);
        if (Number.isInteger(portNum) && portNum > 1024) return true;
        return 'Please enter a valid port number.';
      },
    },
  ]);

  const { projectName, hostName, port } = answers;
  const targetDir = path.join(process.cwd(), projectName);

  console.log(
    chalk.cyan(`\nCreating a new Mycelial Shell in ${chalk.bold(targetDir)}...`)
  );

  try {
    if (fs.existsSync(targetDir)) {
      throw new Error(`Directory ${projectName} already exists!`);
    }

    fs.copySync(TEMPLATE_DIR, targetDir);

    // Create a replacements object with keys that match our placeholders
    const replacements = {
      PROJECT_NAME: projectName,
      HOST_NAME: hostName,
      PORT: port,
    };

    processTemplates(targetDir, replacements);

    console.log(chalk.green.bold('\n✅ Success! Your new Shell is ready.\n'));
    console.log('Next steps:');
    console.log(chalk.cyan(`  cd ${projectName}`));
    console.log(chalk.cyan('  npm install'));
    console.log(chalk.cyan('  npm run dev'));
  } catch (error) {
    console.error(chalk.red.bold('\n❌ An error occurred:'));
    console.error(chalk.red(error.message));
    if (fs.existsSync(targetDir)) {
      fs.removeSync(targetDir);
    }
  }
}

run();
