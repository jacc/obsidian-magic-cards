import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import type { PluginModule } from "@modules/types";
import { CardView } from "./CardView";

export class CardModule implements PluginModule {
  identifier: string = "card";
  plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  onload(): void {
    this.plugin.addCommand({
      id: "open-magic-cards",
      name: "Open Magic Cards",
      callback: () => {
        this.activateLeaf();
      },
    });

    this.plugin.registerView(
      this.identifier,
      (leaf: WorkspaceLeaf) => new CardView(leaf, this.identifier)
    );
  }

  async activateLeaf(): Promise<void> {
    const { workspace } = this.plugin.app;
    let leaf: WorkspaceLeaf | null = null;

    const leaves = workspace.getLeavesOfType(this.identifier);
    if (leaves.length > 0) {
      // If view already exists, focus it
      leaf = leaves[0];
    } else {
      // Create new leaf in a split
      leaf = workspace.getLeaf("split");
      await leaf.setViewState({
        type: this.identifier,
      });
    }
    workspace.revealLeaf(leaf);
  }

  onunload(): void {}
}
