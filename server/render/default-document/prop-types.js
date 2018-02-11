import PropTypes from 'prop-types'

export default {
  html: PropTypes.string.isRequired,
  ids: PropTypes.array.isRequired,
  css: PropTypes.string.isRequired,
  head: PropTypes.object.isRequired,
  bootstrapData: PropTypes.array,
  assets: PropTypes.object
}
