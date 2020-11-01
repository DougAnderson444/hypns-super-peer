# super-peer
Super peer for pinning hypns / kappa-cores

## Start server

`node server.js`

## github deploy 

npm install --production npm run build pm2 restart hey 3001

Super peer needs to add a discoveryKey in HyPNS node when posted

1. Post discoveryKey to super-peer HyPNS node
2. Open an instance on that node for that dicoveryKey
3. Should pin & propogate the data

