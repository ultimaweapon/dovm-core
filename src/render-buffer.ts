import { Container } from './component';

/**
 * A container that buffering nodes for flushing to a target container later.
 */
export class RenderBuffer implements Container {
  constructor(output: Container) {
    this.output = output;
    this.buffer = [];
  }

  /**
   * Flush all buffering nodes to the output and pass-through any nodes after this.
   */
  flush(): void {
    if (!this.buffer) {
      throw new Error('This buffer already flushed.');
    }

    for (const n of this.buffer) {
      this.output.appendChild(n);
    }

    delete this.buffer;
  }

  appendChild<T extends Node>(node: T): void {
    if (this.buffer) {
      this.buffer.push(node);
    } else {
      this.output.appendChild(node);
    }
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    if (this.buffer) {
      const i = child ? this.buffer.indexOf(child) : -1;

      if (i === -1) {
        this.buffer.push(node);
      } else {
        this.buffer.splice(i, 0, node);
      }

      return node;
    } else {
      return this.output.insertBefore(node, child);
    }
  }

  removeChild<T extends Node>(child: T): T {
    if (this.buffer) {
      const i = this.buffer.indexOf(child);

      if (i === -1) {
        throw new DOMException('The specified child does not exsits.', 'NotFoundError');
      }

      return this.buffer.splice(i, 1)[0] as T;
    } else {
      return this.output.removeChild(child);
    }
  }

  private readonly output: Container;
  private buffer?: Node[];
}
