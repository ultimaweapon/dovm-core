import { Mutex } from 'async-mutex';

/**
 * Represents a function to observe the changes of the value. Do not update the value that being observed inside an observer othewise you will get a dead lock.
 */
export type Observer<T> = (value: T, previous?: T) => Promise<void> | void;

export type Comparer<T> = (a: NonNullable<T>, b: NonNullable<T>) => boolean;
export type Unobserve = () => void;

export interface Observable<T> {
  get(): T;

  /**
   * Register a function to listen for value changed. The specified function will always get called for the current value as an initial value with the previous
   * value as undefined.
   *
   * @param observer The function to get called when the value is changed.
   *
   * @returns The function to remove observer.
   */
  observe(observer: Observer<T>): Promise<Unobserve>;
}

export class ReactiveData<T> implements Observable<T> {
  constructor(value: T, comparer?: Comparer<T>) {
    this.value = value;
    this.observers = new Set();
    this.mutex = new Mutex();

    if (comparer) {
      this.comparer = comparer;
    }
  }

  get(): T {
    return this.value;
  }

  set(value: T): Promise<void> {
    return this.mutex.runExclusive(async () => {
      if (this.equals(value)) {
        return;
      }

      const previous = this.value;

      this.running = true;
      this.value = value;

      for (const observer of this.observers) {
        try {
          await observer(value, previous);
        } catch (e) {
          console.error(e);
        }
      }

      this.running = false;
    });
  }

  async observe(observer: Observer<T>): Promise<Unobserve> {
    this.observers.add(observer);

    if (!this.running) {
      try {
        await this.mutex.runExclusive(() => observer(this.value));
      } catch (e) {
        this.observers.delete(observer);
        throw e;
      }
    } else {
      await this.mutex.waitForUnlock(); // this line never throw: https://github.com/DirtyHairy/async-mutex/blob/master/src/Semaphore.ts#L48
    }

    return () => this.observers.delete(observer);
  }

  private equals(v: T): boolean {
    if (v === this.value) {
      return true;
    } else if (v === undefined || v === null || this.value === undefined || this.value === null || !this.comparer) {
      return false;
    } else {
      return this.comparer(v as NonNullable<T>, this.value as NonNullable<T>);
    }
  }

  private value: T;
  private observers: Set<Observer<T>>;
  private mutex: Mutex;
  private comparer?: Comparer<T>;
  private running?: boolean;
}
