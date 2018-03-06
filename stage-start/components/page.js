import React, { PropTypes } from 'react'

const Page = props => {
  console.log(props)
  return <h1>Page</h1>
}
//   <section>
//     <h1>{props.title.rendered}</h1>
//     <p>This is actually a page thought</p>
//   </section>

// Page.propTypes = {
//   title: PropTypes.shape({
//     rendered: PropTypes.string.isRequired
//   }).isRequired
// }

export default Page
