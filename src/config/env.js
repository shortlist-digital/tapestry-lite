module.exports.helpers = target => {
  const IS_NODE = target === 'node'
  const IS_WEB = target === 'web'
  const IS_DEV =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
  const IS_PROD = process.env.NODE_ENV === 'production'

  return {
    IS_WEB,
    IS_NODE,
    IS_DEV,
    IS_PROD,
    NODE_DEV: IS_NODE && IS_DEV,
    NODE_PROD: IS_NODE && IS_PROD,
    WEB_DEV: IS_WEB && IS_DEV,
    WEB_PROD: IS_WEB && IS_PROD
  }
}

module.exports.env = target => {
  const defaults = {
    NODE_ENV: process.env.NODE_ENV,
    BUILD_TARGET: target === 'web' ? 'client' : 'server',
    CSS_PLUGIN: process.env.CSS_PLUGIN || 'glamor'
  }
  return Object.keys(defaults).reduce((env, key) => {
    env[key] = JSON.stringify(defaults[key])
    return env
  }, {})
}
