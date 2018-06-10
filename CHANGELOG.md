# Change Log

All notable changes to this project will be documented in this file.

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
