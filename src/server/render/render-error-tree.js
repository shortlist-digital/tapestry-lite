import renderTreeToHTML from './render-tree-to-html'
import { log } from '../utilities/logger'
export default async ({ errorComponent, route, match, componentData }) => {
  log.silly('Rendering Error HTML')
  return await renderTreeToHTML({
    Component: errorComponent,
    routeOptions: route.options,
    match,
    componentData
  })
}
