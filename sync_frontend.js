import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.resolve(__dirname, 'Frontend');
const frontendDist = path.resolve(frontendDir, 'dist');
const backendPublic = path.resolve(__dirname, 'Backend', 'public');

console.log('1. Building Frontend with Vite...');
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

console.log('2. Syncing dist to Backend/public...');
if (!fs.existsSync(backendPublic)) {
  fs.mkdirSync(backendPublic, { recursive: true });
}

// Copy dist files into Backend/public
fs.cpSync(frontendDist, backendPublic, { recursive: true });
console.log('✔ Successfully synced Frontend build into Backend/public!');
