import { Container } from './component';
import { Disposable } from './disposable';

export class Toggleable extends Disposable implements Container {
  constructor(parent: Container) {
    super();
    this.guide = document.createComment('');
    this.parent = parent;
    this.parent.appendChild(this.guide);
    this.nodes = [];
    this.visible = false;
  }

  dispose(): void {
    this.parent.removeChild(this.guide);
  }

  appendChild<T extends Node>(node: T): void {
    this.nodes.push(node);

    if (this.visible) {
      this.parent.insertBefore(node, this.guide);
    }
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    const i = child ? this.nodes.indexOf(child) : -1;

    if (i === -1) {
      this.nodes.push(node);

      if (this.visible) {
        this.parent.insertBefore(node, this.guide);
      }
    } else {
      this.nodes.splice(i, 0, node);

      if (this.visible) {
        this.parent.insertBefore(node, child);
      }
    }

    return node;
  }

  removeChild<T extends Node>(child: T): T {
    const i = this.nodes.indexOf(child);

    if (i === -1) {
      throw new DOMException('The specified child does not exsits.', 'NotFoundError');
    }

    const r = this.nodes.splice(i, 1)[0] as T;

    if (this.visible) {
      this.parent.removeChild(child);
    }

    return r;
  }

  show(): void {
    if (this.visible) {
      return;
    }

    for (const node of this.nodes) {
      this.parent.insertBefore(node, this.guide);
    }

    this.visible = true;
  }

  hide(): void {
    if (!this.visible) {
      return;
    }

    for (let i = this.nodes.length - 1; i >= 0; i--) {
      this.parent.removeChild(this.nodes[i]);
    }

    this.visible = false;
  }

  private readonly guide: Comment;
  private readonly parent: Container;
  private readonly nodes: Node[];
  private visible: boolean;
}
