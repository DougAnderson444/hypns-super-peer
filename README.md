# HyPNS Super-Peer

Super peer for pinning HyPNS peers. Keeps the data online when the peers are offline.

## Start server

`npm run start`

## Server Deploy

This code can be deployed via Github action with a push. 

## See status online

A Svelte page has been configured so the page displays all pins. 

## Hyperswarm-Web Proxy

The server also spins up a hyperswarm-web proxy on port 4977 so that peers can proxy into hyperswarm from the browser.