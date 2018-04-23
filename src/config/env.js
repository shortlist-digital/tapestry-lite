module.exports = target => {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    BUILD_TARGET: target === 'web' ? 'client' : 'server',
    CSS_PLUGIN: process.env.CSS_PLUGIN || 'glamor'
  }

  const stringified = Object.keys(env).reduce((env, key) => {
    env[key] = JSON.stringify(key)
    return env
  }, {})

  return stringified
}
