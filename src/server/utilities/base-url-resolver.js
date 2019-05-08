import normaliseUrlPath from './normalise-url-path'

export default (config, query = {}, route) => {
  // Use baseUrl if passed
  if (route.options && route.options.baseUrl) {
    return route.options.baseUrl
  }
  // Handle preview API path
  if (query.tapestry_hash) {
    return `${normaliseUrlPath(config.siteUrl)}/wp-json/revision/v1`
  }
  // Handle wordpress.com API path
  if (config.options && config.options.wordpressDotComHosting) {
    // Remove protocol
    const noProtocolSiteUrl = config.siteUrl.replace(/^https?:\/\//i, '')
    return `https://public-api.wordpress.com/wp/v2/sites/${normaliseUrlPath(
      noProtocolSiteUrl
    )}`
  }
  // Default to standard API path
  return `${normaliseUrlPath(config.siteUrl)}/wp-json/wp/v2`
}
