import React, { PropTypes } from 'react'

const Post = (props) => {
  const post = props[0]
  return (
    <section style={{margin: '20px auto', maxWidth: '760px'}} >
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
