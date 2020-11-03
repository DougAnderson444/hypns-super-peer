const fastify = require('fastify')({
  logger: {
    level: 'info',
    prettyPrint: true
  }
})
const bearerAuthPlugin = require('fastify-bearer-auth')
const keys = new Set([process.env.TOKEN])

// fastify.register(bearerAuthPlugin, {keys})

const HyPNS = require('hypns')
const node = new HyPNS({ persist: true })
const instances = new Map()
const port = 3001

const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        rootKey: {
          type: 'string',
          minLength: 64, // https://json-schema.org/understanding-json-schema/reference/string.html#length
          maxLength: 64
        }
      }
    },
    querystring: {
      rootKey: { type: 'string' }
    },
    params: {},
    headers: {}
  }
}

fastify.register(require('fastify-cors'), { origin: '*' })
// fastify.register(require('./initApp'))
// fastify.register(require('./post-route'), parent => {
//   return { node: parent.node }
// })

// Declare routes
fastify.post('/super/', opts, async (request, reply) => {

  const publicKey = request.body.rootKey
  const instance = await node.open({ keypair: { publicKey } })
  
  await instance.ready()
  
  instances.set(instance.publicKey, instance)
  
  console.log('** POST COMPLETE ** \n', instance.publicKey, ` instances.size: [${instances.size}]`)
  
  return { latest: instance.latest } // posted: request.body.query.rootKey
  
})

fastify.get('/latest/', { schema: { querystring: { rootKey: { type: 'string' } } } },

  async (request, reply) => {

    const publicKey = request.query.rootKey
    const instance = instances.get(publicKey)

    console.log('** GET COMPLETE: Latest: ', instance.latest)

    return { latest: instance.latest } // posted: request.body.query.rootKey
  })

// Run the server!
fastify.listen(port, '::', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
