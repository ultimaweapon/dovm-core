import { Container } from './component';
import { Disposable } from './disposable';

export class Placeholder extends Disposable implements Container {
  constructor(parent: Container) {
    super();
    this.guide = document.createComment('');
    this.parent = parent;
    this.parent.appendChild(this.guide);
  }

  dispose(): void {
    this.parent.removeChild(this.guide);
  }

  appendChild<T extends Node>(node: T): void {
    this.parent.insertBefore(node, this.guide);
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    return this.parent.insertBefore(node, child);
  }

  removeChild<T extends Node>(child: T): T {
    return this.parent.removeChild(child);
  }

  private readonly guide: Comment;
  private readonly parent: Container;
}
