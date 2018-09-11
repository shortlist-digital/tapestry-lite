import React, { Fragment } from 'react'
import fs from 'fs-extra'
import path from 'path'

import stringifyEscapeScript from '../../utilities/stringify-escape-script'

const hasModuleBuildAssets = () =>
  fs.existsSync(path.resolve(process.cwd(), '.tapestry', 'assets-module.json'))

const getBootstrapData = ({ bootstrapData, ids, _tapestryData }) => (
  <script
    dangerouslySetInnerHTML={{
      __html: `window.__TAPESTRY_DATA__ = { appData: ${stringifyEscapeScript(
        bootstrapData
      )}, ids: ${JSON.stringify(ids)}, _tapestry: ${JSON.stringify(
        _tapestryData
      )} }`
    }}
  />
)

const getDevelopmentBundle = () => (
  <script src={'http://localhost:4001/static/js/bundle.js'} />
)

const getProductionBundles = () => {
  const moduleBuild = hasModuleBuildAssets()
  // fetch assets manifest for prod bundles
  const assets = fs.readJsonSync(
    path.resolve(process.cwd(), '.tapestry', 'assets.json')
  )
  // fetch module specific manifect
  const assetsModule = fs.readJsonSync(
    path.resolve(process.cwd(), '.tapestry', 'assets-module.json')
  )

  return (
    <Fragment>
      {Object.keys(assets)
        .filter(Boolean)
        .map((key, index) => (
          <script noModule={moduleBuild} key={index} src={assets[key].js} />
        ))}
      {moduleBuild &&
        Object.keys(assetsModule)
          .filter(Boolean)
          .map((key, index) => (
            <script type="module" key={index} src={assetsModule[key].js} />
          ))}
    </Fragment>
  )
}

const DefaultDocument = ({
  html,
  css,
  ids,
  head,
  bootstrapData,
  _tapestryData,
  loadableState
}) => (
  <html lang="en" {...head.htmlAttributes.toComponent()}>
    <head>
      {head.title.toComponent()}
      {head.base.toComponent()}
      {head.meta.toComponent()}
      {head.link.toComponent()}
      {head.script.toComponent()}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <link rel="shortcut icon" href="/public/favicon.ico" />
    </head>
    <body>
      <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
      {loadableState.getScriptElement()}
      {getBootstrapData({ bootstrapData, ids, _tapestryData })}
      {(process.env.NODE_ENV === 'development' ||
        process.env.NODE_ENV === 'test') &&
        getDevelopmentBundle()}
      {process.env.NODE_ENV === 'production' && getProductionBundles()}
    </body>
  </html>
)

export default DefaultDocument
