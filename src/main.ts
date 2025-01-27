import "./styles.css";
import { type PluginManifest, App, Plugin } from "obsidian";
import type { PluginModule } from "@modules/types";
import { CardModule } from "@modules/view/CardModule";
import {
  MagicCardDefaultSettings,
  MagicCardSettingsManager,
  type MagicCardPluginSettings,
} from "./settings";

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
    this.settings = Object.assign(
      {},
      MagicCardDefaultSettings,
      await this.loadData()
    );
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  onunload() {
    this.modules.forEach((module) => module.onunload());
  }
}
