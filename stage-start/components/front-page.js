import React, { Component } from 'react'
import { Link } from 'react-router'

class Thing extends Component {
  componentDidMount() {
    console.log(`A Thing ${this.props.foo}`)
  }

  render() {
    return <h1>Nothing</h1>
  }
}

const FrontPage = ({data})=>
  <main>
    <ul>
      {
        Object
        .keys(data)
        .map(key => {
          const post = data[key]
          const date = new Date(post.date)
          const slug = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/${post.slug}`
          return (
            <li key={key}>
              <Link
                to={slug}
                dangerouslySetInnerHTML={{
                  __html: post.title.rendered
                }}
                style={{color: 'blue'}}
              />
            </li>
          )
        })
      }
    </ul>
  </main>

export default FrontPage
