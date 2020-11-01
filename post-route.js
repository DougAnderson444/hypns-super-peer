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

module.exports = function (fastify, options, done) {
  const instances = []

  // Declare routes
  fastify.post('/super/', opts, async (request, reply) => {
    // console.log('*** REQUEST ***\n ', request.body, request.query)

    // start listening on the passed rootKey
    const publicKey = request.body.rootKey
    console.log('** REQUEST ** ', publicKey)
    const instance = await options.node.open({ keypair: { publicKey } })
    instance.on('update', (val) => {
      console.log('updated value: ', val.text)
    })
    await instance.ready()
    instances[instance.publicKey] = instance

    console.log('** COMPLETE ** ', instance.publicKey)

    return { good: 'good', node: 'node' } // posted: request.body.query.rootKey
  })

  fastify.get('/latest/', { schema: { querystring: { rootKey: { type: 'string' } } } },
    async (request, reply) => {
      const publicKey = request.query.rootKey
      console.log('** REQUEST ** /latest/', publicKey)
      const instance = instances[publicKey]
      console.log('** COMPLETE: Latest: ', instance.latest)

      return { latest: instance.latest } // posted: request.body.query.rootKey
    })
  done()
}
