import { intro, outro, text, group, cancel, log, spinner } from '@clack/prompts';
import fs from 'fs/promises';

async function setup() {
    intro('Obsidian Plugin Setup');

    const promptGroup = await group(
        {
            displayName: () => text({
                message: 'What is your plugin name?',
                validate: (value) => {
                    if (value.length === 0) return 'Plugin name is required!';
                }
            }),

            description: () => text({
                message: 'Plugin description:',
                validate: (value) => {
                    if (value.length === 0) return 'Description is required!';
                }
            }),

            author: () => text({
                message: 'Author name:',
                validate: (value) => {
                    if (value.length === 0) return 'Author name is required!';
                }
            }),

            authorUrl: () => text({
                message: 'Author URL:',
                validate: (value) => {
                    if (value.length === 0) return 'Author URL is required!';
                }
            })
        },
        {
            onCancel: () => {
                cancel('Setup cancelled');
                process.exit(0);
            }
        }
    );

    const npmName = promptGroup.displayName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    const s = spinner();

    s.start('Updating package.json');
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    packageJson.name = npmName;
    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    s.stop('Updated package.json');

    s.start('Generating manifest.json');
    const manifest = {
        id: npmName,
        name: promptGroup.displayName,
        description: promptGroup.description,
        author: promptGroup.author,
        authorUrl: promptGroup.authorUrl,
        version: '1.0.0',
        minAppVersion: '1.0.0',
        isDesktopOnly: true
    };
    await fs.writeFile('public/manifest.json', JSON.stringify(manifest, null, 2));
    s.stop('Generated manifest.json');

    s.start('Renaming development plugin directory');
    const oldPluginPath = 'dev-vault/.obsidian/plugins/dev-plugin';
    const newPluginPath = `dev-vault/.obsidian/plugins/${npmName}`;
    try {
        await fs.rename(oldPluginPath, newPluginPath);
    } catch (err) {
        // Directory might not exist yet, which is fine
        if (err.code !== 'ENOENT') {
            throw err;
        }
    }
    s.stop('Renamed development plugin directory');

    outro('Setup complete! Your plugin is ready for development.');
}

setup().catch((err) => {
    log.error(err);
    process.exit(1);
});
