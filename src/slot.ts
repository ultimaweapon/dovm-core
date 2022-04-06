import { Component, Container, ServiceCollection } from './component';

export type Slot<P extends any[] = []> = (ctx: SlotContext, ...params: [...P]) => Promise<Component> | Component;

export interface SlotContext {
  services: ServiceCollection;
  container: Container;
}
