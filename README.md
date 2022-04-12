# Document Object View Model
[![npm (scoped)](https://img.shields.io/npm/v/@dovm/core)](https://www.npmjs.com/package/@dovm/core)

Document Object View Model (DOVM) is a next generation framework for building a website by utilizing a full power of TypeScript.

## Problems of current frameworks

### React

- Virtual DOM.
- JSX is a mess.

### Angular

- Too big.
- Too complicated.
- No freedom for project structure.
- Slow.

### Vue

- Virtual DOM.
- No type safety in template.
- Limited type safety between component.

### Svelte

- TypeScript support is horrible.
- Reactivity rely on compiler.

### What is the problem with Virtual DOM?

Well, this blog from Svelte should explain the problems of Virtual DOM: https://svelte.dev/blog/virtual-dom-is-pure-overhead

If you are an experienced React or Vue developers I believed you already faced the problem by yourself.

## DOVM

After we developed Cloudsumé, we decided to create our own framework due to all of available frameworks solve one problem but introduce another problem. Right now we currently experiment DOVM with our own company website: https://ultima.inc

### Design goal

- No Virtual DOM.
- Freedom on project structure.
- Simple and lightweight.
- HTML template instead of JSX, which is compile down into a render function.
- 100% type safety with TypeScript even in the template.
- Fully asynchronous everywhere.
- Direct access on DOM when you need it without any barrier.
- Automatic update only affected DOM when binding data updated using observer pattern.
- Direct access on child component.
- Easy on unit testing due to Dependency Injection.

### Runtime requirements

- ES2017

## Usage

### Install

```sh
npm i --save-dev @dovm/core
```

### webpack configurations

Refer to [dovm-loader](https://github.com/ultimicro/dovm-webpack) for how to configuring webpack.

### Type information for DOVM file

Before you can import DOVM file into TypeScript file you need to create `.d.ts` file with the following content in the root of repository:

```ts
// dovm.d.ts
declare module '*.dovm' {
  export function render(): Promise<void>;
}
```

### Settings for Visual Studio Code

Currently there are no extensions for VS Code to support DOVM. A simple workaround for syntax highlighting is to treat DOVM file as HTML file like this:

```json
{
  "files.associations": {
    "*.dovm": "html"
  }
}
```

### Application root

The following code will replace your `body`:

```ts
import { AppContainer, ComponentActivator, ServiceCollection } from '@dovm/core';
import App from './app';

bootstrap();

async function bootstrap() {
  const services = new ServiceCollection();

  services.add(ComponentActivator, () => new ComponentActivator());

  const app = new App({ services, container: new AppContainer() });
  await app.render();
}
```

```ts
// app.ts
import { Component } from '@dovm/core';
import { render } from './app.dovm';

export default class App extends Component {
}

App.prototype.render = render;
```

```html
<!-- app.dovm -->
<template>
  <body>Hello, world!</body>
</template>
```

### Router

Refer to [@dovm/router](https://github.com/ultimicro/dovm-router) for how to use.

## License

MIT
