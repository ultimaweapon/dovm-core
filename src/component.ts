import { Disposable } from './disposable';
import { Observable, Observer, Unobserve } from './observable';

export type ComponentConstructor<T extends Component, P extends ComponentParams> = new (params: P) => T;
export type ServiceFactory<T extends object> = (services: ServiceCollection) => T;

export interface Container {
  appendChild<T extends Node>(node: T): void;
  insertBefore<T extends Node>(node: T, child: Node | null): T;
  removeChild<T extends Node>(child: T): T;
}

export interface ComponentParams {
  readonly services: ServiceCollection | (() => ServiceCollection);
  readonly container: Container;
  readonly attrs?: {};
  readonly slots?: {};
}

export abstract class Component extends Disposable {
  protected readonly services: ServiceCollection;
  protected readonly activator: ComponentActivator;
  protected readonly container: Container;
  protected readonly children: Array<Node | Component>;

  constructor(p: ComponentParams) {
    super();
    this.dependencies = []; // we need to init this before calling params.services due to it is going to call addDependencies
    this.watches = [];
    this.services = typeof p.services === 'function' ? p.services() : p.services;
    this.activator = this.services.resolve(ComponentActivator);
    this.container = p.container;
    this.children = [];
  }

  async dispose(): Promise<void> {
    // stop observing
    for (const unobserve of this.watches.slice().reverse()) {
      unobserve();
    }

    // dispose children
    for (const child of this.children.slice().reverse()) {
      if (child instanceof Component) {
        await child.dispose();
      } else {
        try {
          this.container.removeChild(child);
        } catch (e) {
          if (!(e instanceof DOMException) || e.name !== 'TypeError') {
            throw e;
          }
        }
      }
    }

    // dispose dependencies
    for (const dep of this.dependencies.slice().reverse()) {
      await dep.dispose();
    }
  }

  addDependencies(...deps: Disposable[]): void {
    this.dependencies.push(...deps);
  }

  render(): Promise<void> | void {
    throw new Error(`Don't know how to render ${this.constructor.name}. Did you forgot to define a render function?`);
  }

  protected createComponent<T extends Component, P extends ComponentParams>(component: ComponentConstructor<T, P>, params: P): T {
    const i = this.activator.activate(component, params);
    this.children.push(i);
    return i;
  }

  protected async watch<T>(target: Observable<T>, handler: Observer<T>): Promise<void> {
    this.watches.push(await target.observe(handler));
  }

  private readonly dependencies: Disposable[];
  private readonly watches: Unobserve[];
}

export class ServiceCollection extends Disposable {
  constructor() {
    super();

    this.factories = new Map();
    this.instances = new Map();
  }

  async dispose(): Promise<void> {
    for (const i of [...this.instances.values()].reverse()) {
      if (i instanceof Disposable) {
        await i.dispose();
      }
    }
  }

  scopeTo(owner: Component): ServiceCollection {
    const scope = new ServiceCollection();

    scope.parent = this;
    owner.addDependencies(scope);

    return scope;
  }

  add<T extends object>(service: new (...args: any[]) => T, factory: ServiceFactory<T>): void {
    this.factories.set(service, factory);
  }

  resolve<T extends object>(service: new (...args: any[]) => T): T {
    let i = this.instances.get(service);

    if (i) {
      return i as T;
    }

    const f = this.factories.get(service);

    if (!f) {
      if (!this.parent) {
        throw new Error(`Don't know how to resolve ${service.name}.`);
      }
      return this.parent.resolve(service);
    }

    this.instances.set(service, i = f(this));

    return i as T;
  }

  private readonly factories: Map<Function, ServiceFactory<object>>;
  private readonly instances: Map<Function, object>;
  private parent?: ServiceCollection;
}

export class ComponentActivator {
  activate<T extends Component, P extends ComponentParams>(component: ComponentConstructor<T, P>, params: P): T {
    return new component(params);
  }
}
