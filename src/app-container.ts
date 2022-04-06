import { Container } from './component';

export class AppContainer implements Container {
  appendChild<T extends Node>(node: T): void {
    if (this.replaced) {
      throw new Error('The application must contain only a single node.');
    } else if (!(node instanceof HTMLBodyElement)) {
      throw new Error('The root of application must be <body>.');
    }

    document.body = node;
    this.replaced = true;
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    throw new Error('The application must contain only a single node.');
  }

  removeChild<T extends Node>(child: T): T {
    return document.removeChild(child);
  }

  private replaced?: boolean;
}
