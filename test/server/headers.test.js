import React from 'react'
import Helmet from 'react-helmet'
import { expect, assert } from 'chai'
import request from 'request'
import { JSDOM } from 'jsdom'
import nock from 'nock'
import fs from 'fs'
import path from 'path'
import Inert from 'inert'
import { css } from 'glamor'
import styled from 'react-emotion'
import dataPosts from '../mocks/posts.json'
import Server, { registerPlugins } from '../../src/server'

describe('Header access', () => {
  const configHeaders = ['vehicle', 'restaurant', 'country']
  const requestHeaders = {
    vehicle: 'firetruck',
    restaurant: 'wooleys',
    language: 'french',
    speed: 'sonic',
    censorship: 'true'
  }

  let server = null
  let uri = null
  let config = {
    headers: configHeaders,
    siteUrl: 'http://dummy.api',
    routes: [
      {
        path: '/',
        component: () => ''
      }
    ]
  }

  beforeEach(async () => {
    server = new Server({ config })
    await registerPlugins({ config, server })
    await server.start()
    uri = server.info.uri
  })

  afterEach(async () => {
    await server.stop()
  })

  it('Contains exactly the headers required by client', done => {
    request.get(
      {
        uri,
        headers: requestHeaders
      },
      (err, res, body) => {
        const dom = new JSDOM(body, {
          runScripts: 'dangerously',
          url: 'http://localhost/'
        })
        const { headers } = dom.window.__TAPESTRY_DATA__._tapestry.requestData
        expect(Object.keys(headers)).to.deep.equal(configHeaders)
        done()
      }
    )
  })

  it('Passed header gets value of null if not in the request', done => {
    request.get(
      {
        uri,
        headers: requestHeaders
      },
      (err, res, body) => {
        const dom = new JSDOM(body, {
          runScripts: 'dangerously',
          url: 'http://localhost/'
        })
        const { headers } = dom.window.__TAPESTRY_DATA__._tapestry.requestData
        expect(headers.vehicle).to.equal(requestHeaders.vehicle)
        expect(headers.country).to.equal(null)
        done()
      }
    )
  })
})
