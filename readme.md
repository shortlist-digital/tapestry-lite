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
  routes: [{
    path: '/:slug/:id',
    endpoint: id => `posts/${id}`,
    component: Post
  }, {
    path: '/about/:slug',
    endpoint: slug => `pages?filter=${slug}`,
    component: Page
  }]
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
        // [function] A React component to handle the surrounding document
        customDocument: ({ html, css, ids, asyncProps, assets }) => {},
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
  }
}
```

## Commands

Tapestry comes with a series of commands to control compiling and running the server.

- `tapestry` - Hot compiles the server/client JavaScript and boots the server in development mode
- `tapestry build` - Compiles the server/client JavaScript
- `tapestry start` - Runs any server/client bundles

You can use `--esmodule` to toggle an ES module build utilising [this technique](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/) from Phil Walton.

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
