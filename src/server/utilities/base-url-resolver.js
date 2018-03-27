import idx from 'idx'
import normaliseUrlPath from './normalise-url-path'

export default ({ siteUrl, options }, url) => {
  // Handle preview API path
  if (idx(url, _ => _.query.tapestry_hash))
    return `${normaliseUrlPath(siteUrl)}/wp-json/revision/v1`
  // Handle wordpress.com API path
  if (options.wordpressDotComHosting) {
    // Remove protocol
    const noProtocolSiteUrl = siteUrl.replace(/^https?:\/\//i, '')
    const siteUrl = normaliseUrlPath(noProtocolSiteUrl)
    return `https://public-api.wordpress.com/wp/v2/sites/${siteUrl}`
  }
  // Default to standard API path
  return `${normaliseUrlPath(siteUrl)}/wp-json/wp/v2`
}
