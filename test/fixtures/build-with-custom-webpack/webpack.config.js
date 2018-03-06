const path = require('path')

module.exports = (config, opts, webpack) => {
  config.resolve.alias.components = path.resolve(__dirname, 'components')
  return config
}
