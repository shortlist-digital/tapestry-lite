import React from 'react'

export default {
  siteUrl: 'http://shortliststudio.foundry.press',
  routes: [
    {
      path: '/',
      getComponent: () => import('./components/front-page')
    },
    {
      path: '/hello',
      component: () => <div><p>hello</p></div>
    }
  ]
}