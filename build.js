const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

// Run the Next.js build
console.log('Running Next.js build...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('Next.js build completed successfully.');
} catch (error) {
  console.error('Next.js build failed:', error);
  process.exit(1);
}

// Check if the problematic directory exists
const publicDir = path.join('.next', 'server', 'app', '(public)');
const manifestFile = path.join(publicDir, 'page_client-reference-manifest.js');

// Create the directory if it doesn't exist
if (!fs.existsSync(publicDir)) {
  console.log(`Creating directory: ${publicDir}`);
  mkdirp.sync(publicDir);
}

// Create an empty manifest file if it doesn't exist
if (!fs.existsSync(manifestFile)) {
  console.log(`Creating empty manifest file: ${manifestFile}`);
  fs.writeFileSync(manifestFile, '// Empty placeholder file');
}

// Check for standalone directory
const standaloneDir = path.join('.next', 'standalone', '.next', 'server', 'app', '(public)');
if (!fs.existsSync(standaloneDir)) {
  console.log(`Creating directory: ${standaloneDir}`);
  mkdirp.sync(standaloneDir);
}

// Copy the manifest file to the standalone directory
const standaloneManifestFile = path.join(standaloneDir, 'page_client-reference-manifest.js');
console.log(`Copying manifest file to: ${standaloneManifestFile}`);
fs.copyFileSync(manifestFile, standaloneManifestFile);

console.log('Build process completed successfully.'); 