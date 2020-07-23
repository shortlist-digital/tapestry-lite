import React from 'react'
import Helmet from 'react-helmet'
import { expect } from 'chai'
import request from 'request'
import nock from 'nock'
import fs from 'fs'
import path from 'path'
import { css } from 'glamor'
import styled from 'react-emotion'
import dataPosts from '../mocks/posts.json'
import Server, { registerPlugins } from '../../src/server'

describe('Document contents', () => {
  const publicFilePath = path.resolve(process.cwd(), 'public', 'test.txt')
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
        path: '/emotion',
        endpoint: () => 'posts',
        component: () => {
          const Paragraph = styled('p')`
            color: #369;
          `
          return <Paragraph>Hello</Paragraph>
        }
      },
      {
        path: '/custom-document',
        component: () => <p>Custom HTML</p>,
        options: {
          customDocument: () => 'testing-document'
        }
      },
      {
        path: '/custom-document-no-doctype',
        component: () => <p>Custom HTML</p>,
        options: {
          customDocument: () => 'testing-document',
          disableDoctype: true
        }
      },
      {
        path: '/custom-document-custom-doctype',
        component: () => <p>Custom HTML</p>,
        options: {
          customDocument: () => 'testing-document',
          customDoctype:
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
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
          customDocument: ({ htmlString, css, helmet, _tapestryData }) => (
            <html>
              <head>
                {helmet.title}
                <style dangerouslySetInnerHTML={{ __html: css }} />
              </head>
              <body>
                <div dangerouslySetInnerHTML={{ __html: htmlString }} />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `const test = ${JSON.stringify(_tapestryData)}`
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
    // create redirects file sync to prevent race condition
    if (!fs.existsSync(path.dirname(publicFilePath))) {
      fs.mkdirSync(path.dirname(publicFilePath))
    }
    fs.writeFileSync(
      publicFilePath, // file name
      'Hello World', // create dummy file
      'utf8' // encoding
    )
    // mock api response
    nock('http://dummy.api')
      .get('/wp-json/wp/v2/posts')
      .times(5)
      .reply(200, dataPosts.data)
    // boot tapestry server

    server = new Server({ config })
    await registerPlugins({ config, server })
    await server.start()
    uri = server.info.uri
  })

  afterEach(async () => {
    fs.unlink(publicFilePath, () => {})
    await server.stop()
  })

  it('Contains correct Bootstrap data', done => {
    request.get(uri, (err, res, body) => {
      expect(body).to.contain(
        `window.__TAPESTRY_DATA__ = { appData: {"data":${JSON.stringify(
          dataPosts.data
        )
          .replace(/\//g, '\\/')
          .replace(/\u2028/g, '\\u2028')
          .replace(/\u2029/g, '\\u2029')}}`
      )
      expect(body).to.contain('ids: ["vg9k2b"]')
      done()
    })
  })

  it('Contains Glamor styles', done => {
    request.get(uri, (err, res, body) => {
      expect(body).to.contain('{color:#639;}')
      done()
    })
  })

  it('Contains Emotion styles if selected', done => {
    // set emotion env variable
    process.env.CSS_PLUGIN = 'emotion'
    request.get(`${uri}/emotion`, (err, res, body) => {
      expect(body).to.contain('{color:#369;}')
      // reset
      process.env.CSS_PLUGIN = undefined
      done()
    })
  })

  it('Uses default document if no custom document used', done => {
    request.get(uri, (err, res, body) => {
      expect(body).to.contain('<!doctype html>')
      expect(body).to.contain(
        '<link rel="shortcut icon" href="/public/favicon.ico"/>'
      )
      done()
    })
  })

  it('Uses custom document if available', done => {
    request.get(`${uri}/custom-document`, (err, res, body) => {
      expect(body).to.contain('testing-document')
      expect(body).to.contain('<!doctype html>')
      done()
    })
  })

  it('Custom document can have doctype disabled', done => {
    request.get(`${uri}/custom-document-no-doctype`, (err, res, body) => {
      expect(body).to.contain('testing-document')
      expect(body).to.not.contain('<!doctype html>')
      done()
    })
  })

  it('Custom document can have custom doctype', done => {
    request.get(`${uri}/custom-document-custom-doctype`, (err, res, body) => {
      expect(body).to.contain('testing-document')
      expect(body).to.contain(
        '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'
      )
      done()
    })
  })

  it('Passes correct data to custom document', done => {
    request.get(`${uri}/custom-document/with-data`, (err, res, body) => {
      expect(body).to.contain('Custom Title')
      expect(body).to.contain('Custom HTML')
      expect(body).to.contain('{font-size:13px;}')
      done()
    })
  })

  it('Handles static files', done => {
    request.get(`${uri}/public/test.txt`, (err, res, body) => {
      expect(res.statusCode).to.equal(200)
      expect(body).to.contain('Hello World')
      done()
    })
  })
})
