# Change Log

All notable changes to this project will be documented in this file.

# 1.5.1 (05-07-2018)

* Test for falsey values when setting proxies

# 1.5.0 (04-07-2018)

* Added support for proxies from a different domain

# 1.4.5 (22-06-2018)

* Fix oddly formatted chunks (within assets.json) adding malformed script references to the page

# 1.4.4 (20-06-2018)

* Boost initial boot time with improved Webpack config creation

# 1.4.3 (12-06-2018)

* Fixed server hot reloading

# 1.4.2 (10-06-2018)

* Fixed Loadable Components regression in 1.4.1

# 1.4.1 (08-06-2018)

* Removed `matchRoutes` helper from client bundle

# 1.4.0 (08-06-2018)

* Changed schema of `window.__TAPESTRY_DATA__`. Now includes request data and params. This is means that where previously you'd access `props.params` in the top level component, you'll now use `props._tapestry.requestData.params`

# 1.3.1 (07-06-2018)

* Fixed Loadable Components initial server render

# 1.3.0 (04-06-2018)

* Added `disableDoctype` functionality to `routeOptions`
