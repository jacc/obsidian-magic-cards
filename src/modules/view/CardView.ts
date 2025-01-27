import { ItemView, WorkspaceLeaf } from "obsidian";
import Card from "./Card.svelte";
import { mount } from "svelte";
import type MagicCardsPlugin from "src/main";

export class CardView extends ItemView {
  identifier: string;
  component!: Card;
  plugin: MagicCardsPlugin;

  constructor(
    leaf: WorkspaceLeaf,
    identifier: string,
    plugin: MagicCardsPlugin
  ) {
    super(leaf);
    this.identifier = identifier;
    this.plugin = plugin;
  }

  getViewType(): string {
    return this.identifier;
  }

  getDisplayText(): string {
    return "Magic Cards";
  }

  async onOpen(): Promise<void> {
    this.component = mount(Card, {
      target: this.contentEl,
      props: {
        app: this.app,
        settings: this.plugin.settings,
      },
    }) as Card;
  }

  async onClose(): Promise<void> {}
}
