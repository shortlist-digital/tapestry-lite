import React from 'react'
import Helmet from 'react-helmet'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'

import Server from '../../src/server'
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
    server = new Server({ config: config })
    process.env.DISABLE_CACHE = true
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
