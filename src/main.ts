import "./styles.css";
import { type PluginManifest, App, Plugin } from "obsidian";
import type { PluginModule } from "@modules/types";
import { CardModule } from "@modules/view/CardModule";
import { MagicCardSettingsManager } from "./settings";

interface MagicCardPluginSettings {
  openai_key: string;
  deepseek_key: string;
  google_key: string;
  model_url: string;
}

const DEFAULT_SETTINGS: Partial<MagicCardPluginSettings> = {
  openai_key: "",
  deepseek_key: "",
  google_key: "",
  model_url: "",
};

export default class MagicCardsPlugin extends Plugin {
  private modules: PluginModule[];
  public settings!: MagicCardPluginSettings;

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    this.modules = [new CardModule(this)];

    this.addSettingTab(new MagicCardSettingsManager(this.app, this));
  }

  async onload() {
    await this.loadSettings();
    this.modules.forEach((module) => module.onload());
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {
    this.modules.forEach((module) => module.onunload());
  }
}
