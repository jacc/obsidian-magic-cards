import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import type { PluginModule } from "@modules/types";
import { CardView } from "./CardView";
import type MagicCardsPlugin from "src/main";

export class CardModule implements PluginModule {
  identifier: string = "card";
  plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  onload(): void {
    // Need to cast plugin to MagicCardsPlugin since it requires additional properties
    const magicCardsPlugin = this.plugin as MagicCardsPlugin;

    magicCardsPlugin.addCommand({
      id: "open-magic-cards",
      name: "Open Magic Cards",
      callback: () => {
        this.activateLeaf();
      },
    });

    magicCardsPlugin.registerView(
      this.identifier,
      (leaf: WorkspaceLeaf) =>
        new CardView(leaf, this.identifier, magicCardsPlugin)
    );
  }

  async activateLeaf(): Promise<void> {
    const { workspace } = this.plugin.app;
    let leaf: WorkspaceLeaf | null = null;

    const leaves = workspace.getLeavesOfType(this.identifier);
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getLeaf("split");
      await leaf.setViewState({
        type: this.identifier,
      });
    }
    workspace.revealLeaf(leaf);
  }

  onunload(): void {}
}
