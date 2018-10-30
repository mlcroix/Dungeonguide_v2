var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log('Gulp is starting my app on PORT: ' + port)
});

app.get('/', function (req, res) {
    res.json("welcome");
});

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));
  });