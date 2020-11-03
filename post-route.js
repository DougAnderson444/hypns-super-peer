const fp = require('fastify-plugin')

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

function posting (fastify, opts, done) {

  const keys = new Set(['thetokenhere'])
  fastify.register(require('fastify-bearer-auth'), {keys})

  const instances = []
  fastify.decorate('instances', instances)

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

  done()
}

module.exports = fp(posting)
