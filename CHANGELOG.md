# Change Log

All notable changes to this project will be documented in this file.

# 6.1.0 (05-12-2019)

- Created `cachePurgeHandler` method to allow users to declare all possible keys of a cache entry

# 6.0.0 (21-11-2019)

- Upgraded React, React Hot Loader, Loadable Components and Babel
- Removed `--esmodule` option

# 5.3.0 (11-11-2019)

- Added feature to enable client to pass a function which modifies the cache key used, taking in the request and initial cache key as arguments

# 5.2.0 (24-10-2019)

- Added feature to enable client access to headers passed during requests
- Added tests for header access feature

# 5.1.0 (18-06-2019)

- Added `apiBasePath` option to override the default baseUrl behaviour at the site level
- Added `apiBasePath` option to override the default baseUrl behaviour at the route level
- Renamed `baseUrl` to `apiBaseUrl` at the route level

# 5.0.1 (29-05-2019)

- Changed the `PORT` env to `TAPESTRY_PORT` in the tests
- Changed the `LOG_LEVEL` in the tests

# 5.0.0 (29-05-2019)

- Update Winston and logging methods to allow project level NGINX
- Create `TAPESTRY_HOST` & `TAPESTRY_PORT` env vars

# 4.4.0 (08-05-2019)

- Added a `baseUrl` option per route to overriding the default baseUrl behaviour, including the preview revisions endpoint

# 4.3.0 (27-03-2019)

- Enabled `--esmodule` mode, to create `module` builds without unneccessary transpilations

# 4.2.0 (12-03-2019)

- Return 404 if any API endpoints fail
- Only wrap API response in `{ data: {} }` if an array

# 4.1.0 (19-02-2019)

- Allow `{ path: '/', error: true }` to return 404
- Only bundle `missing-view` and `error-view` if PROD

# 4.0.1 (14-02-2019)

- Check if request is preview before returning cached response

# 4.0.0 (14-02-2019)

- Revert preview cache behaviour

# 3.0.2 (14-02-2019)

- Serialize/Deserialize responseObject into cache

# 3.0.1 (13-02-2019)

- Fix potential cache/response issue in dynamic

# 3.0.0 (13-02-2019)

- Set cache for all preview links, rely on Tapestry Wordpress Plugin to produce unique hash per update
- Remove tapestry query string data from URL on load
- Fix normalised path issue

# 2.3.4 (08-02-2019)

- Pass through headers for proxies

# 2.3.3 (12-07-2018)

- Refactor dynamic handler, and render function in preperation for serverless command

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
