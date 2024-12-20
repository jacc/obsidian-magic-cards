import fs from 'fs/promises';
import path from 'path';

async function fileExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

async function verifySetup() {
    // Check if manifest exists
    const manifestPath = 'public/manifest.json';
    if (!await fileExists(manifestPath)) {
        throw new Error('Setup not completed: manifest.json not found. Please run "npm run setup" first.');
    }

    // Read manifest and package.json
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));

    // Verify manifest has required fields
    const requiredFields = ['id', 'name', 'author', 'description'];
    for (const field of requiredFields) {
        if (!manifest[field]) {
            throw new Error(`Setup not completed: manifest.json missing ${field}. Please run "npm run setup" first.`);
        }
    }

    // Verify name consistency
    if (manifest.id !== packageJson.name) {
        throw new Error(`Plugin ID mismatch: manifest.json (${manifest.id}) doesn't match package.json name (${packageJson.name}). Please run "npm run setup" to fix.`);
    }

    // All checks passed
    console.log('✓ Setup verification passed');
}

// Run verification
verifySetup().catch(error => {
    console.error(`\x1b[31m${error.message}\x1b[0m`);
    process.exit(1);
});
