import MagicCardsPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class MagicCardSettingsManager extends PluginSettingTab {
  plugin: MagicCardsPlugin;

  constructor(app: App, plugin: MagicCardsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("OpenAI API Key")
      .setDesc("Enter your OpenAI API key")
      .addText((text) =>
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.openai_key)
          .onChange(async (value) => {
            this.plugin.settings.openai_key = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Deepseek API Key")
      .setDesc("Enter your Deepseek API key")
      .addText((text) =>
        text
          .setPlaceholder("Enter Deepseek API key")
          .setValue(this.plugin.settings.deepseek_key)
          .onChange(async (value) => {
            this.plugin.settings.deepseek_key = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Google API Key")
      .setDesc("Enter your Google API key")
      .addText((text) =>
        text
          .setPlaceholder("Enter Google API key")
          .setValue(this.plugin.settings.google_key)
          .onChange(async (value) => {
            this.plugin.settings.google_key = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
