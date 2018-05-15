module.exports = target => {
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
