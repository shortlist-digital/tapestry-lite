import React, { PropTypes } from 'react'
import ObjectInspector from 'react-object-inspector'
import { Link } from 'react-router'

const Post = ({data}) => {
  const post = data[0]
  return (
    <section style={{margin: '20px auto', maxWidth: '760px'}} >
      <Link to="/">Home</Link>
      <style>
        {`img {
          display: block;
          max-width: 100%;
          min-width: 100%;
          margin: auto;
        `}
      </style>
      <h1 style={{color: 'red', fontSize: 48}} dangerouslySetInnerHTML={{__html: post.title.rendered}} />
      { post._embedded['wp:featuredmedia'] &&
        <img src={post._embedded['wp:featuredmedia'][0].source_url}/>
      }
      <p
        dangerouslySetInnerHTML={{
          __html: post.content.rendered
        }}>
      </p>
    </section>
  )
}

export default Post
