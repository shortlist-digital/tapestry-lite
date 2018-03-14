const path = require('path')
const fs = require('fs')
const url = require('url')

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = relativePath => path.resolve(appDirectory, relativePath)

//https:/www.mysite.com
const envPublicUrl = process.env.PUBLIC_URL

function ensureSlash(path, needsSlash) {
  const hasSlash = path.endsWith('/')
  if (hasSlash && !needsSlash) {
    return path.substr(path, path.length - 1)
  } else if (!hasSlash && needsSlash) {
    return `${path}/`
  } else {
    return path
  }
}

// I don't see homepage used that often, environments are better
const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage

function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson)
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/')
  return ensureSlash(servedUrl, true)
}

const resolveOwn = relativePath => path.resolve(__dirname, '../../', relativePath)

// Windows compatability
const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? '' : ':')
  .filter(Boolean)
  .filter(folder => !path.isAbsolute(folder))
  .map(resolveApp)

module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appBuild: resolveApp('.tapestry'),
  appBuildPublic: resolveApp('.tapestry/public'),
  appBuildServer: resolveApp('.tapestry/server.js'),
  appManifest: resolveApp('.tapestry/assets.json'),
  appPublic: resolveApp('public'),
  appNodeModules: resolveApp('node_modules'),
  appSrc: resolveApp('src'),
  appPackageJson: resolveApp('package.json'),
  testsSetup: resolveApp('src/setupTests.js'),
  appBabelRc: resolveApp('.babelrc'),
  appEslintRc: resolveApp('.eslintrc'),
  appTapestryConfig: resolveApp('tapestry.config.js'),
  appWebpackConfig: resolveApp('webpack.config.js'),
  nodePaths: nodePaths,
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'),
  ownDevServer: resolveOwn('src/config/hot'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
}
