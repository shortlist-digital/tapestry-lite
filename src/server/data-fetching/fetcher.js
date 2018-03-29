import fetch from 'isomorphic-fetch'

const fetcher = url => {
  const Agent = url.startsWith('https')
    ? require('https').Agent
    : require('http').Agent
  return fetch(url, {
    agent: new Agent({
      keepAlive: true,
      keepAliveMsecs: 20000
    })
  })
}

export default fetcher
