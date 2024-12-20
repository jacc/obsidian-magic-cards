# Obsidian Plugin Template (Svelte)

A template for creating Obsidian plugins using Svelte and TypeScript.

## Getting Started

1. **Initial Setup (Required)**
   ```bash
   # Install dependencies
   npm install

   # Run the setup script to configure your plugin
   npm run setup
   ```
   The setup script will prompt you for:
   - Plugin name
   - Description
   - Author name
   - Author URL

   This will automatically:
   - Update package.json with your plugin's name
   - Generate manifest.json with your plugin's metadata

2. **Development**
   ```bash
   npm run dev
   ```
   This will:
   - Create the plugin directory in your development vault
   - Build your plugin in development mode
   - Watch for changes
   - Hot reload the plugin in your development vault

3. **Production Build**
   ```bash
   npm run build
   ```
   This creates a production build of your plugin.

## Project Structure

- `src/` - Source code
  - `main.ts` - Plugin entry point
  - `modules/` - Plugin modules and components
- `public/` - Static files
  - `manifest.json` - Plugin manifest (auto-generated)
- `dev-vault/` - Development vault for testing

## Development Safeguards

This template includes automatic verification to ensure:
- Setup script has been run before development
- Plugin name consistency across package.json, manifest.json, and plugin directory
- All required plugin metadata is present

If you encounter errors about missing setup or mismatched names, run:
```bash
npm run setup
```

## IDE Setup

[VS Code](https://code.visualstudio.com/) is recommended with the following extensions:
- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [TypeScript and JavaScript Language Features](https://marketplace.visualstudio.com/items?itemName=vscode.typescript-language-features)
