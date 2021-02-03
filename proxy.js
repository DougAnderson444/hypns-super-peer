const HyperswarmServer = require('hyperswarm-web/server')
const http = require('http')
const send = require('send')
const path = require('path')
const DEFAULT_PORT = 4977 // HYPR on a cellphone keypad

const INDEX_HTML_LOCATION = path.join(__dirname, 'index.html')

module.exports = (network = {}, port = DEFAULT_PORT) => {
  const server = http.createServer(function onRequest (req, res) {
    send(req, INDEX_HTML_LOCATION)
      .pipe(res)
  })

  const wsServer = new HyperswarmServer() // { network }

  wsServer.listenOnServer(server)

  console.log(`Hyperswarm proxy Listening on ws://localhost:${port}`)
  console.log(`-> Proxy available on ws://localhost:${port}/proxy`)
  console.log(`-> Signal available on ws://localhost:${port}/signal`)

  server.listen(port)
}
