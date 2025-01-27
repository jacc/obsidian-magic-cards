import { ItemView, WorkspaceLeaf } from "obsidian";
import Card from "./Card.svelte";
import { mount } from "svelte";
import type MagicCardsPlugin from "../../main";

export class CardView extends ItemView {
  identifier: string;
  component!: Card;

  constructor(leaf: WorkspaceLeaf, identifier: string) {
    super(leaf);
    this.identifier = identifier;
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
      },
    }) as Card;
  }

  async onClose(): Promise<void> {}
}
