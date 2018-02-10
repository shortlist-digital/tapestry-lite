import server from './server'

let currentApp

const run = async function() {
  try {
    currentApp = server
    await currentApp.start()
    if (module.hot) {
      module.hot.accept('./server', async function() {
        await currentApp.stop({ timeout: 0 })
        currentApp = server
        await currentApp.start()
      })
    } 
    console.log('Server started at: ' + server.info.uri)
  } catch (e) {
    console.error(e)
  }
}

run()
