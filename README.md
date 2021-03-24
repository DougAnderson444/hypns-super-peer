# HyPNS Super-Peer

Super peer for pinning HyPNS peers. Keeps the data online when the peers are offline.

## .env File Setup

You'll need:

```
# recommended, so not just anyone can pin to your server
# give this to your friends
TOKEN=the-token-code-you-give-to-those-who-you-will-pin-for

# optional, if you want to push this code to glitch
# don't give to anyone except github webhook
SECRET=the-secret-needed-to-push-updates-to-Glitch.com

```

Then your friends can put this TOKEN in their pinning code:

```js

// use Vercel fetch, as it includes auto-retry, so if your Glitch node is asleep it'll wake it up
const fetch = require('@vercel/fetch')(require('node-fetch')) // to make fetch work in nodejs

// replace YOUR-GLITCH-URL with, well, your glitch url
const url = 'https://YOUR-GLITCH-URL.glitch.me/pin/' || 'https://your-super-peer-here.com/pin/'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TOKEN}`
      },
      body: JSON.stringify(req.body) // body data type must match "Content-Type" header
    })

```

## Start server

`npm run start`

## Server Deploy

This code can be deployed via Github action with a push. 

## Glitch Deploy

You can easily deply this code to Glitch, and update automatically on each push.

## See status online

A Svelte page has been configured so the page displays all pins. 

## Hyperswarm-Web Proxy

The server also spins up a hyperswarm-web proxy on port 4977 so that peers can proxy into hyperswarm from the browser.