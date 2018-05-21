import React from 'react'
import loadable from 'loadable-components'

const Component = loadable(() => import('./components/front-page'))

export default {
  siteUrl: 'http://shortliststudio.foundry.press',
  routes: [
    {
      path: '/',
      component: Component
    },
    {
      path: '/hello',
      component: () => (
        <div>
          <p>hello</p>
        </div>
      )
    }
  ]
}
