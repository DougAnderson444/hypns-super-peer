const port = 3001;

// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: true
})

// Declare a route
fastify.get('/super/', function (request, reply) {
  reply.send({ hello: 'fastify' })
})

// Run the server!
fastify.listen(port, '0.0.0.0', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})