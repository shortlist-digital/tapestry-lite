import React from 'react'
import Helmet from 'react-helmet'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'
import { css } from 'glamor'
import dataPosts from '../mocks/posts.json'
import Server from '../../src/server'

describe('Document contents', () => {
  let server = null
  let uri = null
  let config = {
    routes: [
      {
        path: '/',
        endpoint: () => 'posts',
        component: () => <p className={css({ color: '#639' })}>Hello</p>
      },
      {
        path: '/custom-document',
        component: () => <p>Custom HTML</p>,
        options: {
          customDocument: () => 'testing-document'
        }
      },
      {
        path: '/custom-document/with-data',
        endpoint: () => 'posts',
        component: () => (
          <div>
            <Helmet>
              <title>Custom Title</title>
            </Helmet>
            <p className={css({ fontSize: '13px' })}>Custom HTML</p>
          </div>
        ),
        options: {
          customDocument: ({ html, css, head, bootstrapData}) => (
            <html>
              <head>
                {head.title.toComponent()}
                <style dangerouslySetInnerHTML={{ __html: css }} />
              </head>
              <body>
                <div dangerouslySetInnerHTML={{ __html: html }} />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `const test = ${JSON.stringify(bootstrapData)}`
                  }}
                />
              </body>
            </html>
          )
        }
      }
    ],
    siteUrl: 'http://dummy.api'
  }

  beforeEach(async () => {
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/posts')
      .times(5)
      .reply(200, dataPosts.data)
    // boot tapestry server
    server = new Server({config})
    await server.start()
    uri = server.info.uri
  })

  afterEach(async () => await server.stop())

  it('Contains correct Bootstrap data', done => {
    request.get(uri, (err, res, body) => {
      expect(body).to.contain(
        `window.__BOOTSTRAP_DATA__ = {"data":${JSON.stringify(dataPosts.data)
          .replace(/\//g, '\\/')
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029')}`
      )
      done()
    })
  })

  it('Contains Glamor styles', done => {
    request.get(uri, (err, res, body) => {
      expect(body).to.contain('{color:#639;}')
      done()
    })
  })

  it('Uses default document if no custom document used', done => {
    request.get(uri, (err, res, body) => {
      expect(body).to.contain(
        '<!doctype html>'
      )
      expect(body).to.contain(
        '<link rel="shortcut icon" href="/public/favicon.ico"/>'
      )
      done()
    })
  })

  it('Uses custom document if available', done => {
    request.get(`${uri}/custom-document`, (err, res, body) => {
      expect(body).to.contain('testing-document')
      done()
    })
  })

  it('Passes correct data to custom document', done => {
    request.get(`${uri}/custom-document/with-data`, (err, res, body) => {
      expect(body).to.contain('Custom Title')
      expect(body).to.contain('Custom HTML')
      expect(body).to.contain(
        `const test = {"data":${JSON.stringify(dataPosts.data)}}`
      )
      expect(body).to.contain('{font-size:13px;}')
      done()
    })
  })
})
