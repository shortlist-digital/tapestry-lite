import renderTreeToHTML from './render-tree-to-html'
import { log } from '../utilities/logger'

export default async ({ route, match, componentData, queryParams }) => {
  log.silly('Rendering Success HTML', { match })

  return await renderTreeToHTML({
    Component: route.component,
    routeOptions: route.options,
    match,
    componentData,
    queryParams
  })
}
