const https = require('https')
const fs = require('fs')

const WebSocket = require('ws')
const WebSocketServer = WebSocket.Server

const serverConfig = {
  key: fs.readFileSync('/etc/letsencrypt/live/challenge.rowanmeara.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/challenge.rowanmeara.com/fullchain.pem')
}

let handleRequest = function(request, response) {
  console.log('request received: ' + request.url)
  response.writeHead(200, {'Content-Type': 'application/javascript'})
  response.end(fs.readFileSync('client/webrtc.js'))
}

let httpsServer = https.createServer(serverConfig, handleRequest)
httpsServer.listen(3434)

let wss = new WebSocketServer({server: httpsServer})
wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message)
    wss.broadcast(message)
  })
})

wss.broadcast = function(data) {
  this.clients.forEach(function(client) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}
