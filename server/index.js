import server from './server'

let currentApp
const timeLabel = 'Hot Reload Restart'

const run = async function() {
  try {
    currentApp = await server()
    await currentApp.start()
    if (module.hot) {
      module.hot.accept('./server', async function() {
        console.time(timeLabel)
        await currentApp.stop({ timeout: 0 })
        currentApp = await server()
        await currentApp.start()
        console.timeEnd(timeLabel)
      })
    } 
    console.log('Server started at: ' + currentApp.info.uri)
  } catch (e) {
    console.error(e)
  }
}

run()
