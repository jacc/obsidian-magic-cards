import type { Plugin } from 'obsidian';
export interface PluginModule {
    identifier: string;
    plugin: Plugin;
    onload(): void;
    onunload(): void;
    activateView?(): Promise<void>;
}