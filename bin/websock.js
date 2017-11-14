const WebSocket = require('ws');
const WebSocketServer = WebSocket.Server;
const http = require('https');

let httpServer = http.createServer()
httpServer.listen(3434)

let wss = new WebSocketServer({server: httpServer});

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
    // Broadcast any received message to all clients
    console.log('received: %s', message);
    wss.broadcast(message);
  });
});

wss.broadcast = function(data) {
  this.clients.forEach(function(client) {
    if(client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};
