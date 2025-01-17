const HyperswarmServer = require('hyperswarm-web/server')
const DEFAULT_PORT = 4977 // HYPR on a cellphone keypad

// const HyperspaceClient = require('@hyperspace/client')

module.exports = async (params) => {
  const { server, port = DEFAULT_PORT, network = {} } = params
  // If there is a Hyperspace daemon running, use that for the network
  const opts = {} // needs to be empty because https://github.com/hypercore-protocol/hyperspace-rpc/pull/11

  /**
   * Hyperswarm-web fails on Hyperspace's network instance for some reason.
   */
  // check for a possible hyperspace presence
  // try {
  //   // Set initial state
  //   let pending = true

  //   // wait until the server is ready
  //   HyperspaceClient.serverReady({}).then(() => {
  //     pending = false
  //   })

  //   const timePromise = new Promise((resolve, reject) => {
  //     setTimeout(resolve, 400, 'one') // timeout after a second, that's 10 trys
  //   })

  //   await timePromise

  //   if (!pending) {
  //     console.log((new Date()).toISOString(), ' - Hyperspace ready \n')

  //     const client = new HyperspaceClient()

  //     // wait for client to be ready
  //     await client.ready()
  //     await client.network.ready()
  //     opts = client && client.network && typeof client.network === 'object' ? { network: client.network } : {}
  //   }
  // } catch (error) {
  //   console.error('hyperspace client error', error)
  // }

  const wsServer = new HyperswarmServer(opts) // { network }

  wsServer.listenOnServer(server)

  console.log(`Hyperswarm proxy Listening on ws://localhost:${port}`)
  console.log(`-> Proxy available on ws://localhost:${port}/proxy`)
  console.log(`-> Signal available on ws://localhost:${port}/signal`)

  server.listen(port)
}
