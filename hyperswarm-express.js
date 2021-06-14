const HyperswarmProxyWSServer = require('hyperswarm-proxy-ws/server')

class HyperswarmExpress extends HyperswarmProxyWSServer {
  handleStream (stream) {
    this.handleStream(stream)
  }
}

module.exports = HyperswarmExpress