require('dotenv').config()
const path = require('path')

const HyPNS = require('hypns')
const fs = require('fs-extra')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const proxy = require('./proxy')
const { execSync } = require('child_process')

/**
 * Local db to persist pins on reloads
 */
const file = '.data/db.json'
fs.ensureFileSync(file)
const adapter = new FileSync('.data/db.json')
const db = low(adapter)
// Set some defaults
if (db.get('pins').size().value() < 1) { db.defaults({ pins: {} }).write() }

/**
 * HYPNS Node and functions
 */
const hypnsNode = new HyPNS({ persist: true, applicationName: '.data/hypnsapp' })
const instances = new Map()

const setUp = async (publicKey) => {
  // skip if it's already configured on this node
  if (hypnsNode.instances.has(publicKey)) {
    return hypnsNode.instances.get(publicKey).latest
  }
  const instance = await hypnsNode.open({ keypair: { publicKey } })
  await instance.ready()

  // skip if the instance is already listening
  if (instance.listenerCount('update') > 0) return

  instance.on('update', (val) => {
    const note = `Update ${instance.publicKey}, latest: ${instance.latest ? instance.latest.timestamp : null}, ${instance.latest ? instance.latest.text : null}`
    console.log(note)
    db.set(`pins.${publicKey}`, instance.latest)
      .write()
    // feedEmitter.emit('feed', note)
  })

  instances.set(instance.publicKey, instance)
  db.set(`pins.${publicKey}`, instance.latest).write()
  const note = `** Setup COMPLETE: ', ${instance.publicKey}, pins.size: [${db.get('pins').size().value()}]`
  console.log(note)
  // feedEmitter.emit('feed', note)
  return instance.latest
}

// load list from storage and initialize the node
const init = async () => {
  await hypnsNode.init() // sets up the corestore-networker / hyperswarm instance

  /**
    * Also set up a hyperswarm-web proxy server for when this is run at home
    */
  proxy({ network: hypnsNode.swarmNetworker.swarm })

  const pins = db.get('pins').value() // Find all publicKeys pinned in the collection
  Object.keys(pins).forEach((key) => {
    setUp(key)
  })
}

init()

/**
 * Enable server to interact with the HyPNS Node and show streams of updates
 */
const app = express()
const port = process.env.PORT || 3001

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public')))
app.use(cors())

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '/public', 'index.html'))
})
/**
 * Pin if they have a TOKEN that matches the one in the .env file
 */
app.post('/pin/', verifyToken, async (request, response) => {
  if (request.token !== process.env.TOKEN) { response.sendStatus(403) }

  const publicKey = request.body.rootKey
  const latest = await setUp(publicKey)
  response.json({ latest })
})

// TODO: Should also validate the rootKey
function verifyToken (req, res, next) {
  const bearerHeader = req.headers.authorization

  if (bearerHeader) {
    const bearer = bearerHeader.split(' ')
    const bearerToken = bearer[1]
    req.token = bearerToken
    next()
  } else {
    // Forbidden
    res.sendStatus(403)
  }
}

app.get('/pins', (request, response) => {
  const pins = db.get('pins').value() // Find all publicKeys pinned in the collection
  response.json(pins) // sends pins back to the page
})
/**
 * Stream a feed to updates about who is pinned
 */
app.get('/feed', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders() // flush the headers to establish SSE with client

  const counter = 0
  const pinsWriter = () => {
    res.write('event: update\n\n') // res.write() instead of res.send()
    res.write(`data: ${JSON.stringify(db.get('pins').value())}\n\n`) // res.write() instead of res.send()
    res.write(`id: ${counter}\n\n`)
  }
  // const interValID = setInterval(writeCounter, 1000)
  const interValID = setInterval(pinsWriter, 5000)

  // If client closes connection, stop sending events
  res.on('close', () => {
    console.log('client dropped me')
    clearInterval(interValID)
    res.end()
  })
})

/**
* Enable deploy to glitch.com
*/
app.post('/deploy', (request, response) => {
  if (request.query.secret !== process.env.SECRET) {
    response.status(401).send()
    return
  }

  if (request.body.ref !== 'refs/heads/master') {
    response.status(200).send('Push was not to master branch, so did not deploy.')
    return
  }

  const repoUrl = request.body.repository.git_url

  console.log('Fetching latest changes.')
  const output = execSync(
    `git checkout -- ./ && git pull -X theirs ${repoUrl} master && refresh`
  ).toString()
  console.log(output)
  response.status(200).send()
})

const listener = app.listen(port, () => {
  console.log('Server is up at ', listener.address())
})
