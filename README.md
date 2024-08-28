# salo

`salo` is a toolkit that makes building reactive web apps easy, with `0kb of initial JavaScript` and lightning-fast rendering.

It works seamlessly with `Cloudflare Workers` and `Service Workers`, and can also be used in Node or other server-side JavaScript environments.

**Note:** `salo` is still under development, and version 1.0 is not ready yet. Expect changes and improvements as we work towards the initial release.

## Packages

- [`@jaimytacovega/salo/router`](./src/router.js) - Manage web requests using URLPattern for route matching.
  
- [`@jaimytacovega/salo/html`](./src/html.js) - Stream HTML templates and render temporary templates while waiting for asynchronous functions to finish processing the final template.

- [`@jaimytacovega/salo/actions`](./src/actions.js) - Add reactivity to HTML nodes with 0kb of initial JavaScript.

## Coming Soon

- [`@jaimytacovega/salo/offline`](./src/offline.js) Manage browser cache resources to handle HTML template requests.