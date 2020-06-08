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

const sanitizeQueryValues = ObjectOfEntries => {
  if (!ObjectOfEntries) return {}

  const sanitized = {}

  Object.entries(ObjectOfEntries).forEach(
    entry => (sanitized[entry[0]] = sanitizeString(entry[1]))
  )

  return sanitized
}

export default sanitizeQueryValues
