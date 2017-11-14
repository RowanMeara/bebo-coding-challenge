const https = require('https')
const fs = require('fs')

const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

const serverConfig = {
  key: fs.readFileSync('/etc/letsencrypt/live/challenge.rowanmeara.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/challenge.rowanmeara.com/fullchain.pem')
}

let httpsServer = https.createServer(serverConfig)
httpsServer.listen(3001)

let wss = new WebSocketServer({server: httpsServer})
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message)
    wss.broadcast(message)
  })
})

wss.broadcast = function(data) {
  let clientsReady = 0
  this.clients.forEach(function(client) {
    if(client.readyState === WebSocket.OPEN) {
      clientsReady++
    }
  })
  if (clientsReady > 2) {
    this.clients.forEach(function(client) {
      if(client.readyState === WebSocket.OPEN) {
        client.send(data)
      }
    })
  }
}
