const HyPNS = require('hypns')
const port = 3001
const fastify = require('fastify')({
  logger: { level: 'info', prettyPrint: true }
})

fastify.register(require('fastify-helmet'))
fastify.register(require('fastify-cors'), { origin: '*' })

fastify.register((fastifyInstance, options, done) => {
  fastifyInstance.decorate('node', new HyPNS({ persist: true }))
  fastifyInstance.decorate('instances', new Map())

  fastifyInstance.register((fi, options, done) => {
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
            Authorization: { type: 'string' }
          },
          required: ['Authorization']
        }
      }
    }
    const keys = new Set(['thetokenhere'])
    fi.register(require('fastify-bearer-auth'), { keys }) // only apply token requirement to this fastify instance (fi)
    fi.post('/super/', opts, async (request, reply) => {
      const publicKey = request.body.rootKey
      const instance = await fastifyInstance.node.open({ keypair: { publicKey } })
      await instance.ready()
      instance.on('update', (val) => {
        const lag = (new Date(Date.now())) - (new Date(instance.latest.timestamp))
        console.log('Update ', instance.publicKey, ` latest:${instance.latest.timestamp} ${instance.latest.text} [${new Date(lag).getSeconds()} sec]`)
      })
      fastifyInstance.instances.set(instance.publicKey, instance)
      console.log('** POST COMPLETE ** \n', instance.publicKey, ` instances.size: [${fastifyInstance.instances.size}]`)
      reply.send({ latest: instance.latest }) // posted: request.body.query.rootKey
    })

    done()
  })

  // curl -H "Authorization: Bearer thetokenhere" -X GET https://super.peerpiper.io/super/pins/
  fastifyInstance.get('/super/pins/',
    async (request, reply) => {
      let out = ''
      for (const inst of fastifyInstance.instances.values()) {
        if (inst.latest) {
          out += `\n<br />${inst.latest.timestamp} ${inst.publicKey}: ${inst.latest.text}`
        } else {
          out += `\n<br />${inst.publicKey}: ${inst.latest}`
        }
      }

      console.log('** Pins/Out: ', out)

      reply
        .code(200)
        .type('text/html')
        .send(out)
    }
  )

  fastifyInstance.get('/super/latest/', { schema: { querystring: { rootKey: { type: 'string' } } } },

    async (request, reply) => {
      const publicKey = request.querystring.rootKey
      const instance = fastifyInstance.instances.get(publicKey)

      console.log('** GET COMPLETE: Latest: ', instance.latest)

      return { latest: instance.latest } // posted: request.body.query.rootKey
    }
  )

  done()
})

// fastify.register(require('./initApp'))
// fastify.register(require('./post-route'), parent => {
//   return { node: parent.node }
// })

// Run the server!
fastify.listen(port, '::', function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  fastify.log.info(`server listening on ${address}`)
})
