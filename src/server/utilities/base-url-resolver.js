import idx from 'idx'
import normaliseUrlPath from './normalise-url-path'

export default (config) => {
  if (idx(config, _ => _.options.wordpressDotComHosting)) {
    // Remove protocol
    const noProtocolSiteUrl = config.siteUrl.replace(/^https?:\/\//i, '')
    const siteUrl = normaliseUrlPath(noProtocolSiteUrl)
    return `https://public-api.wordpress.com/wp/v2/sites/${siteUrl}`
  } else {
    return `${normaliseUrlPath(config.siteUrl)}/wp-json/wp/v2`
  }
}
