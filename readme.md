<p align="center">
  <img src="https://cdn.rawgit.com/shortlist-digital/tapestry-wp/master/logo/tapestry-logo-glyph.svg" height="100" >
  <br>
  <br>
  <a href="https://www.npmjs.org/package/tapestry-lite"><img src="https://img.shields.io/npm/v/tapestry-lite.svg?style=flat" alt="npm"></a> <a href="https://circleci.com/gh/shortlist-digital/tapestry-lite/tree/master"><img src="https://circleci.com/gh/shortlist-digital/tapestry-lite/tree/master.svg?style=shield" alt="circleci"></a>
</p>

# Tapestry Lite

An opinionated React application service for the WordPress Rest API. Create React components and let Tapestry handle the data loading, server rendering, JavaScript bundling and more.

## Features

- Data handling
- Server rendered React
- Small, secure Node server through Hapi
- CSS-in-JS out of the box
- Hot reloading
- Production ready

## Installation

`yarn add tapestry-lite react react-dom`

## Usage

Tapestry has a couple of commands to handle building and running the project, you can pop these into your NPM scripts.

`tapestry` will create the client/server bundles and run the server in development mode, `tapestry build` will create the client and server bundles for production and `tapestry start` will run the server in production mode.

Often we'll set up our projects like so:

```json
{
  "scripts": {
    "start": "tapestry",
    "build": "tapestry build",
    "start:prod": "tapestry start"
  }
}
```

Create a `tapestry.config.js` in the root of your project and export an object with your WordPress site URL and routes or components to render.

```js
import Post from './components/post'
import Page from './components/page'

export default {
  siteUrl: 'http://your-wordpress.url',
  components: { Post, Page }
}
```

These components will match the default WordPress permalink routes for each page type. e.g. `/2017/12/08/a-post-slug`.

These default components are a simple way to connect a WordPress instance to your React application, to control the routing schema completely you can add a `routes` array to your config. Each route requires a `path` and a `component` for a static page, to access data from WordPress pass in an `endpoint`

```js
import Post from './components/post'
import Page from './components/page'

export default {
  siteUrl: 'http://your-wordpress.url',
  routes: [
    {
      path: '/:slug/:id',
      endpoint: id => `posts/${id}`,
      component: Post
    },
    {
      path: '/about/:slug',
      endpoint: slug => `pages?filter=${slug}`,
      component: Page
    }
  ]
}
```

## Options

`tapestry.config.js` has a number of options to modify the Tapestry bundling and server.

```js
{
  // [string] URL for your WordPress instance
  siteUrl: '',
  // [object] Container for React components
  components: {
    // [function] React components for rendering a post, page, category
    Category,
    CustomError,
    FrontPage,
    Page,
    Post
  },
  // [array] Container for route objects
  routes: [
    {
      // [string] Path to match component
      path: '',
      path: '/path/:dynamic-path/:optional-path?'

      // [function] React component to render
      component: () => {},
      // [any] Source for WordPress API data, can be one of array, object or string, can also be a function that returns any of those data-types. When used as a function it has access to the dynamic parameters from the path
      endpoint: 'posts',
      endpoint: ['posts', 'pages'],
      endpoint: { posts: 'posts', pages: 'pages' },
      endpoint: (id) => `posts/${id}`,
      endpoint: (id) => [`posts/${id}`, `pages/${id}`],
      endpoint: (id) => { posts: `posts/${id}`, pages: `pages/${id}` }
      // [object] Container for route specific options
      options: {
        // [boolean] Return the doctype with or without the HTML string
        disableDoctype: false,
        // [string] Custom route specific URL for your WordPress instance
        baseUrl: '',
        // [string] Custom route specific api URL
        apiBaseUrl: '',
        // [string] Custom route specific api base path, utilising the siteUrl as the base
        apiBasePath: '',
      }
    }
  ],
  // [array] Paths to proxy through to the WordPress URL
  proxyPaths: [],
  // [object] Redirects from key to value e.g. { 'from': 'to' }
  redirectPaths: {},
  // [string] [uri] URL for JSON redirects file, will get picked up on server boot
  redirectsEndpoint: '',
  // [object] Container for site options
  options: {
    // [string] 'localhost', '0.0.0.0'
    host: '',
    // [number] 3030
    port: 3030,
    // [boolean] Registers https Hapi plugin
    forceHttps: false,
    // [boolean] Wordpress.com hosting configuration
    wordpressDotComHosting: false
  },
  // function(req, key) to modify the cache key. Uses browser request and initial cache key as arguments and must return a string which replaces the initial cache key.
  cacheKeyHandler: (request, cacheKey) => {
    let newKey = cacheKey
    if (request.headers['region'] === 'en-us') {
      newKey = cacheKey + ':region-us'
    }
    return newKey
  },
  // function(key) to declare all keys per cache entry. Uses initial cache key as arguments and must return a string or array representing all possible keys that could be used for the cache entry.
  cachePurgeHandler: (key) => {
    return [key, key + ':region-us']
  },
  // [array] Request headers you wish to access from the front-end
  headers: ['region'],
}
```

## Commands

Tapestry comes with a series of commands to control compiling and running the server.

- `tapestry` - Hot compiles the server/client JavaScript and boots the server in development mode
- `tapestry build` - Compiles the server/client JavaScript
- `tapestry start` - Runs any server/client bundles

## Custom compilation

### Babel

If you need to modify the default Tapestry `babel` configuration, you can create a `.babelrc` file in the root of your project and Tapestry will use it to override any default options. You will need to import `tapestry-lite/babelrc` to enable the required plugins.

### Webpack

To modify the Webpack config you can create a `webpack.config.js` in the root of your project that exports a modified config.

An example config that adds an alias for `components`:

```js
const path = require('path')
const merge = require('webpack-merge')

module.exports = (default, options, webpack) => {
  const custom = {
    resolve: {
      alias: {
        components: path.resolve(
          __dirname, 'src', 'components'
        )
      }
    }
  }
  merge(default, custom)
}
```

### Environment variables

To configure the application per environment we have a series of environment variables available to use.

#### Server

`TAPESTRY_HOST`
Define the host for the server

`TAPESTRY_PORT`
Define the port for the server

`ENABLE_CONCURRENCY`
Boolean to toggle multiple server instances

`WEB_CONCURRENCY`
Number of server instances to boot, if not configured this will default to the number of cores available

`SERVER_SOURCE_MAPS`
Boolean to toggle source maps on server JS bundles

#### Cache

`CACHE_CONTROL_MAX_AGE`
Cache age for all server responses

`STATIC_CACHE_CONTROL_MAX_AGE`
Cache age for static assets bundled from Webpack

`CACHE_MAX_ITEM_COUNT`
Maximum number of items to store in memory or Redis

`CACHE_MAX_AGE`
Maximum age of item in memory or Redis

`REDIS_URL`
URL for Redis DB

`SECRET_PURGE_PATH`
Path to clear the in memory cache or Redis, defaults to `purge`. Purge will use the path from `/purge` as the key when removing from the cache, e.g. `/purge/hello/world` will remove `hello/world` from the cache

#### Logging

`LOG_LEVEL`
Tapestry has a series of logs from the server using [Winston](https://github.com/winstonjs/winston), `LOG_LEVEL` corresponds to the log level of Winston [github.com/winstonjs/winston#logging-levels](https://github.com/winstonjs/winston#logging-levels)

`TAPESTRY_LOGS_FOLDER`
Directory to store logs, defaults to writing to `STDOUT`

#### Application

`CSS_PLUGIN`
One of `emotion` or `glamor` to switch between CSS-in-JS libraries, defaults to `glamor`

`NODE_ENV`
Can be used to toggle `production` mode, will affect Webpack, Babel and other vendor services
