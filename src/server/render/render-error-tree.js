import renderTreeToHTML from './render-tree-to-html'
import { log } from '../utilities/logger'

export default async ({ Component, route, match, componentData }) => {
  log.debug('Rendering Error HTML')
  return await renderTreeToHTML({
    Component,
    routeOptions: route.options,
    match,
    componentData
  })
}
