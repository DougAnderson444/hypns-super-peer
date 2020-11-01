const fp = require('fastify-plugin')

const HyPNS = require('hypns')

async function initApp (fastify, options, done) {
  const node = new HyPNS({ persist: true })
  console.log('Storage: ', node._storage)
  fastify.decorate('node', node)
  // must call when ready
  done()
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = fp(initApp)
