var WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ port: 8080 });

var users = {};

wss.on('connection', function onConnection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
//    ws.send('The server has received: ' + message);

    received = JSON.parse(message);
    console.log(received);

    if (received['command'] == 'register') {
          // Store this ws in the users dictionary, for this user
          users[received['user_id']] = ws;
          ws.send('Registered');
          ws.send(Object.keys(users).length + ' online');
    }

    if (received['command'] == 'unregister') {
          // Remove from users dict
          delete users[received['user_id']];
          ws.send('Unregistered');
          ws.send(Object.keys(users).length + ' online');
    }

    if (received['command'] == 'call') {
        callee_ws = users[received['callee']];
        if (callee_ws) {
            callee_ws.send(message);
        }
    }

    if (received['command'] == 'answer') {
        caller_ws = users[received['caller']];
        if (caller_ws) {
            caller_ws.send(message);
        }
    }

    console.log('Done processing incoming message');
  });
 
  ws.send('Connected');

  ws.on('close', function onClose() {
      console.log('A ws connection closed.');
      //console.log(ws);
      console.log(Object.keys(users).length + ' online');
  });
});
