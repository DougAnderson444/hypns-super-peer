const fastify = require('fastify')({
  logger: { level: 'info', prettyPrint: true }
})
const helmet = require('fastify-helmet')
fastify.register(helmet)

const bearerAuthPlugin = require('fastify-bearer-auth')

const keys = new Set(['thetokenhere'])
fastify.register(bearerAuthPlugin, {keys})

const HyPNS = require('hypns')
const node = new HyPNS({ persist: true })
const instances = new Map()
const port = 3001

// https://www.fastify.io/docs/latest/Validation-and-Serialization/
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
    querystring: {},
    params: {},
    headers: {
      type: 'object',
      properties: {
        'Authorization': { type: 'string' }
      },
      required: ['Authorization']}
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
  
  console.log('** POST COMPLETE ** \n', instance.publicKey, ` instances.size: [${instances.size}]
  latest: ${instance.latest}
  `)
  
  return { latest: instance.latest } // posted: request.body.query.rootKey
  
})

fastify.get('/super/latest/', { schema: { querystring: { rootKey: { type: 'string' } } } },

  async (request, reply) => {

    const publicKey = request.querystring.rootKey
    const instance = instances.get(publicKey)

    console.log('** GET COMPLETE: Latest: ', instance.latest)

    return { latest: instance.latest } // posted: request.body.query.rootKey 
})

// curl -H "Authorization: Bearer thetokenhere" -X GET https://super.peerpiper.io/super/pins/
fastify.get('/super/pins/',

  async (request, reply) => {

    let out = ''
    // iterate over [key, value] entries
    for (let inst of instances) { // the same as of instances.entries()
      out += `\n<br />${inst.publicKey}: ${inst.latest}`
    }

    reply
    .code(200)
    .type('text/html')
    .send(out)
  }
)
// Run the server!
fastify.listen(port, '::', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
