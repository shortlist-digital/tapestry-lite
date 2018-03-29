import React from 'react'
import HTTPStatus from 'http-status'
import Helmet from 'react-helmet'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import Server from '../../src/server'
import dataPost from '../mocks/post.json'
import dataPosts from '../mocks/posts.json'
import dataPage from '../mocks/page.json'

describe('Custom components rendering', () => {
  let server = null
  let uri = null
  let config = {
    components: {
      FrontPage: () => (
        <div>
          <Helmet>
            <title>Custom title</title>
          </Helmet>
          <p>Hello</p>
        </div>
      )
    },
    siteUrl: 'http://dummy.api'
  }

  before(async () => {
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/posts?_embed')
      .times(2)
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/posts?slug=slug&_embed')
      .reply(200, dataPage)
    server = new Server({config: config})
    await server.start()
    uri = server.info.uri
  })

  after(async () => await server.stop())

  it('Custom components are rendered', done => {
    request.get(uri, (err, res, body) => {
      if (err) throw new Error(err)
      expect(body).to.contain('Hello')
      done()
    })
  })

  it('Custom head tags are rendered', done => {
    request.get(uri, (err, res, body) => {
      if (err) throw new Error(err)
      expect(body).to.contain('Custom title')
      done()
    })
  })
})

describe('Default view rendering', () => {
  let server = null
  let uri = null
  let config = {
    components: {
      Category: () => <p>Category component</p>,
      Post: () => <p>Post component</p>,
      Page: () => <p>Page component</p>,
      FrontPage: () => <p>FrontPage component</p>
    },
    siteUrl: 'http://dummy.api'
  }

  before(async () => {
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/posts?_embed')
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/pages?slug=slug&_embed')
      .reply(200, dataPage)
      .get('/wp-json/wp/v2/posts?filter[category_name]=test&_embed')
      .reply(200, dataPosts.data)
      .get('/wp-json/wp/v2/posts?slug=slug&_embed')
      .reply(200, dataPost)
    // boot  server
    server = new Server({config :config})
    await server.start()
    uri = server.info.uri
  })

  after(async () => await server.stop())

  it('Default FrontPage is rendered', done => {
    request(uri, (err, res, body) => {
      expect(body).to.contain('FrontPage component')
      done()
    })
  })

  it('Default Category is rendered', done => {
    request(`${uri}/category/test`, (err, res, body) => {
      expect(body).to.contain('Category component')
      done()
    })
  })

  it('Default Page is rendered', done => {
    request(`${uri}/slug`, (err, res, body) => {
      expect(body).to.contain('Page component')
      done()
    })
  })

  it('Default Post is rendered', done => {
    request(`${uri}/year/month/day/slug`, (err, res, body) => {
      expect(body).to.contain('Post component')
      done()
    })
  })
})

// describe('Error view rendering', () => {
//   let server = null
//   let config = {
//     components: {},
//     siteUrl: 'http://dummy.api'
//   }

//   before(async done => {
//     // mock api response
//     nock('http://dummy.api')
//       .get('/wp-json/wp/v2/posts?_embed')
//       .times(5)
//       .reply(200, dataPosts.data)
//       .get('/wp-json/wp/v2/posts?slug=slug&_embed')
//       .reply(200, dataPage)
//       .get('/wp-json/wp/v2/pages?slug=404-route&_embed')
//       .times(5)
//       .reply(404, { data: { status: 404 } })
//     done()
//   })

//   afterEach(async () => await server.stop())

//   it('Show MissingView in DEV if component missing', async done => {
//     server = await Server(config)
//     await server.start()
//     request.get(server.info.uri, (err, res, body) => {
//       expect(body).to.contain('Missing component')
//       done()
//     })
//   })

//   it('Show DefaultError in PROD if component missing', async done => {
//     server = await Server(config, { __DEV__: false })
//     server.start()
//     request.get(server.info.uri, (err, res, body) => {
//       expect(body).to.contain('Application Error')
//       done()
//     })
//   })

//   it('Show DefaultError if API 404', async done => {
//     server = await Server({
//       ...config,
//       components: { Page: () => <p>Hello</p> }
//     })
//     await server.start()
//     request.get(`${server.info.uri}/404-route`, (err, res, body) => {
//       expect(body).to.contain(404)
//       expect(body).to.contain(HTTPStatus[404])
//       done()
//     })
//   })

//   it('Show DefaultError if route 404', async done => {
//     server = await Server({
//       ...config,
//       components: { Page: () => <p>Hello</p> }
//     })
//     await server.start()
//     request.get(
//       `${server.info.uri}/route/not/matched/in/any/way`,
//       (err, res, body) => {
//         expect(body).to.contain(404)
//         expect(body).to.contain(HTTPStatus[404])
//         done()
//       }
//     )
//   })

//   it('Show CustomError if defined', async done => {
//     server = await Server({
//       ...config,
//       components: {
//         CustomError: () => <p>Custom Error</p>,
//         Page: () => <p>Hello</p>
//       }
//     })
//     await server.start()
//     request.get(`${server.info.uri}/404-route`, (err, res, body) => {
//       expect(body).to.contain('Custom Error')
//       done()
//     })
//   })

//   it('Status code and message are available to CustomError', async done => {
//     server = await Server({
//       ...config,
//       components: {
//         CustomError: ({ code, message }) => (
//           <p>
//             Custom Error {code} {message}
//           </p>
//         ),
//         Page: () => <p>Hello</p>
//       }
//     })
//     await server.start()
//     request.get(`${server.info.uri}/404-route`, (err, res, body) => {
//       expect(body).to.contain('Custom Error')
//       expect(body).to.contain('404')
//       expect(body).to.contain('Not Found')
//       done()
//     })
//   })
// })
