import React from 'react'
import PropTypes from 'prop-types'
import DefaultError from '../default-error'

const MissingView = response => (
  <DefaultError {...response}>
    <h1>Missing component</h1>
    {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
  </DefaultError>
)

MissingView.propTypes = {
  response: PropTypes.object
}
export default MissingView
