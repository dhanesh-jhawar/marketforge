import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envExamplePath = path.resolve(__dirname, '../.env.example');
const envPath = path.resolve(__dirname, '../.env');

function check() {
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env file not found. Copying .env.example to .env for development defaults.');
    fs.copyFileSync(envExamplePath, envPath);
  }
  console.log('✅ Environment configuration file verified.');
}

check();
