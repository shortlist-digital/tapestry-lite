# Change Log

All notable changes to this project will be documented in this file.

# 2.3.2 (11-12-2018)

- Lock version number of ps-tree to fix event-stream issue (https://github.com/dominictarr/event-stream/issues/116)

# 2.3.1 (11-12-2018)

- Fix issue with dev server and hook registering order

# 2.3.0 (11-12-2018)

- Broadcast websocket events for server compilation to the client

# 2.2.0 (11-9-2018)

- React Error Overlay for browser error notification in dev
- Noisier terminal output during dev

# 2.1.0 (10-11-2018)

- Added `customDoctype` option to `routeOptions`. If a value is passed it will override the default one`<!doctype html>`

# 2.0.0 (11-10-2018)

- Updated all babel packages to 7.0.0
- Replaced `babel-preset-razzle` with our custom babel set-up, we still use mostly the same packages and the same env configuration but we're now adding our loadable-components and emotion here
- Improve support for custom `.babelrc`. This has always worked but it was using a slightly black magic webpack/babel approach, this update uses `babel-merge` to combine any custom babel presets/plugins with our base set
- Expose babel configuration via `tapestry-lite/babel`, helpful for testing purposes on the project using tapestry
- Updated `@babel/preset-env` useBuiltIns to usage, this will only polyfill what we use, rather than the entire subset of required polyfills for the browser
- Add support for `browserslist` file to define what `@babel/polyfill` should include, this is the behaviour supported in `@babel/preset-env` so browerslist files will become more common
- Removed the unneccessary `type="text/javascript"` from the bootstrap data and fixed the incorrectly escaped `_tapestry` object
- Add support for an object export from a custom webpack config

# 1.5.3 (07-09-2018)

- Filter falsey items from routes array

# 1.5.2 (05-09-2018)

- Fix case sensitive redirect lookup
- Pass headers on through API proxy

# 1.5.1 (05-07-2018)

- Test for falsey values when setting proxies

# 1.5.0 (04-07-2018)

- Added support for proxies from a different domain

# 1.4.5 (22-06-2018)

- Fix oddly formatted chunks (within assets.json) adding malformed script references to the page

# 1.4.4 (20-06-2018)

- Boost initial boot time with improved Webpack config creation

# 1.4.3 (12-06-2018)

- Fixed server hot reloading

# 1.4.2 (10-06-2018)

- Fixed Loadable Components regression in 1.4.1

# 1.4.1 (08-06-2018)

- Removed `matchRoutes` helper from client bundle

# 1.4.0 (08-06-2018)

- Changed schema of `window.__TAPESTRY_DATA__`. Now includes request data and params. This is means that where previously you'd access `props.params` in the top level component, you'll now use `props._tapestry.requestData.params`

# 1.3.1 (07-06-2018)

- Fixed Loadable Components initial server render

# 1.3.0 (04-06-2018)

- Added `disableDoctype` functionality to `routeOptions`
