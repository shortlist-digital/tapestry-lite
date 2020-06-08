const sanitizeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
}
const sanitizeString = string =>
  string.replace(/[&<>"'/]/gi, match => sanitizeMap[match])

const sanitizeQueryValues = queriesObj => {
  if (!queriesObj) return {}

  const sanitized = {}

  for (let key in queriesObj) {
    sanitized[key] = sanitizeString(queriesObj[key])
  }

  return sanitized
}

export default sanitizeQueryValues
