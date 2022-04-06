export abstract class Disposable {
  abstract dispose(): Promise<void> | void;
}
