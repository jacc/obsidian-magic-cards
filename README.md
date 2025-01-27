# Obsidian Magic Cards Plugin

Generate AI-powered flashcards directly in Obsidian using large language models.

![Demo](https://via.placeholder.com/800x400.png?text=Magic+Cards+Demo+Placeholder)

## Features
- 🚀 Generate flashcards from active note content
- 🔌 Support for multiple AI providers (Deepseek, OpenAI)
- 🌊 Real-time streaming of generated cards
- 📝 Add generated cards directly to your notes
- ⚙️ Customizable model settings
- 🛑 Interactive stop generation button

## Installation
1. Install via [BRAT](https://github.com/TfTHacker/obsidian42-brat):
   - Add this repository URL: `https://github.com/StevenStavrakis/obsidian-plugin-svelte-template`
2. Enable the plugin in Obsidian's settings
3. Configure your API keys in plugin settings

## Usage
1. Open a note with content you want to generate cards from
2. Open the Magic Cards panel using either:
   - Command Palette: "Open Magic Cards"
   - Ribbon icon (if configured)
3. Select your AI provider and model from dropdowns
4. Add any additional context/instructions in the input field
5. Click "Generate" and watch cards appear in real-time
6. Choose to either:
   - 💾 "Add to note" for desired cards
   - 🗑️ "Discard" unwanted cards

## Development Setup
```bash
bun install
bun run dev
```

## Configuration
Access settings via Obsidian's Settings > Community Plugins > Magic Cards:

- 🔑 OpenAI API Key
- 🔑 Deepseek API Key
- 🔑 Google API Key (future support)
- ⚡ Advanced Mode toggle
- 🌐 Custom model URL (in advanced mode)

## Support
Report issues on [GitHub Issues](https://github.com/jacc/obsidian-magic-cards/issues)

Join our Discord Server (coming soon)

## License
MIT License - See [LICENSE](https://github.com/jacc/obsidian-magic-cards/blob/main/LICENSE) for details
