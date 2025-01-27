import MagicCardsPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface MagicCardPluginSettings {
  // Built-in providers
  openai_key: string;
  deepseek_key: string;
  google_key: string;

  // If user wants to use their own self-hosted model, have them enable advanced mode first.
  advanced_mode: boolean;
  model_url: string;
}

export const MagicCardDefaultSettings: Partial<MagicCardPluginSettings> = {
  openai_key: "",
  deepseek_key: "",
  google_key: "",
  advanced_mode: false,
  model_url: "",
};

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

    new Setting(containerEl)
      .setName("Advanced Mode")
      .setDesc("Enable advanced mode")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.advanced_mode)
          .onChange(async (value) => {
            this.plugin.settings.advanced_mode = value;
            await this.plugin.saveSettings();
            this.display();
          })
      );

    if (this.plugin.settings.advanced_mode) {
      new Setting(containerEl)
        .setName("Model URL")
        .setDesc("Enter your model URL")
        .addText((text) =>
          text
            .setPlaceholder("Enter model URL")
            .setValue(this.plugin.settings.model_url)
            .onChange(async (value) => {
              this.plugin.settings.model_url = value;
              await this.plugin.saveSettings();
            })
        );
    }
  }
}
