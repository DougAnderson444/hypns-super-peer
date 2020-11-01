// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: true
})

const port = 3001

const opts = {
  schema: {
    body: {
      type: 'object',
      properties: {
        rootKey: { type: 'string' }
      }
    },
    querystring: {
      rootKey: { type: 'string' }
    },
    params: {},
    headers: {}
  }
}

// Declare routes
fastify.post('/super/', opts, async (request, reply) => {
  console.log('*** REQUEST ***\n ', request.body, request.query, '*** REQUEST ***\n ')
  return { good: 'good' } // posted: request.body.query.rootKey
})

fastify.get('/super/', function (request, reply) {
  reply.send({ hello: 'fastify' })
})

// Run the server!
fastify.listen(port, '::', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
