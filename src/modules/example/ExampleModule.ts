import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import type { PluginModule } from "@modules/types";
import { ExampleView } from "./ExampleView";

export class ExampleModule implements PluginModule {
    identifier: string = 'example';
    plugin: Plugin;

    constructor(plugin: Plugin) {
        this.plugin = plugin;
    }

    onload(): void {
        this.plugin.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
            // Called when the user clicks the icon.
            this.activateLeaf();
        });

        this.plugin.registerView(
            this.identifier,
            (leaf: WorkspaceLeaf) => new ExampleView(leaf, this.identifier),
        );

    }

    async activateLeaf(): Promise<void> {
        const { workspace } = this.plugin.app;
        let leaf: WorkspaceLeaf | null = null;

        const leaves = workspace.getLeavesOfType(this.identifier);
        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            leaf = workspace.getRightLeaf(false);
            if (leaf === null) {
                throw new Error('No leaf found');
            }
            await leaf.setViewState({
                type: this.identifier,
            });
        }
        workspace.revealLeaf(leaf);
    }

    onunload(): void {

    }

}