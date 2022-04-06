# Document Object View Model

Document Object View Model (DOVM) is a next generation framework for building website.

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

- TypeScript support in horrible.
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

## Sample code

```ts
// index.ts
import { AppContainer, ServiceCollection } from '@dovm/core';
import App from './app';

import './index.css';

bootstrap();

async function bootstrap() {
  const services = new ServiceCollection();
  const container = new AppContainer();
  const app = new App({ services, container, attrs: {}, slots: {} });
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
<component class="NavigationBar" src="./navigation-bar"></component>
<component class="Hero" src="./hero"></component>
<component class="Product" src="./product"></component>
<component class="Contact" src="./contact"></component>
<component class="Footer" src="./footer"></component>

<template>
  <body>
    <navigation-bar></navigation-bar>
    <header class="header">
      <hero></hero>
    </header>
    <main>
      <product></product>
      <contact></contact>
    </main>
    <footer></footer>
  </body>
</template>
```

```ts
// footer/index.ts
import { Component, ComponentParams, ReactiveData } from '@dovm/core';
import { render } from './index.dovm';

export default class Footer extends Component {
  protected readonly now: ReactiveData<Date>;

  constructor(params: ComponentParams) {
    super(params);

    this.now = new ReactiveData(new Date());
  }
}

Footer.prototype.render = render;
```

```html
<!-- footer/index.dovm -->
<template>
  <footer class="footer">
    <div class="container">
      <img !src="./logo-white.svg" width="150px">
      <div class="social-link">
        <a href="https://www.facebook.com/ultimicro" target="_blank">
          <img !src="./facebook.svg" class="social-icon">
        </a>
        <a href="https://twitter.com/ultimicro" target="_blank">
          <img !src="./twitter.svg" class="social-icon">
        </a>
        <a href="https://www.linkedin.com/company/ultimicro/" target="_blank">
          <img !src="./linkedin.svg" class="social-icon">
        </a>
      </div>
      <p>Copyright © $now.getFullYear() Ultima Microsystems, Inc. All rights reserved.</p>
    </div>
  </footer>
</template>
```

## License

MIT
