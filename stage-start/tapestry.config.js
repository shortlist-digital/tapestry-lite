import React from 'react'
import Page from './components/page'
import Post from './components/post'
import FrontPage from './components/front-page'

export default {
  components: {
    Post,
    Page,
    FrontPage
  },
  siteUrl: 'http://shortliststudio.foundry.press',
  options: {
    wordpressDotComHosting: true
  }
}
